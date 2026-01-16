import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { ChangeProfessionalWorkHoursUseCase } from '@/domain/scheduling/application/use-cases/change-professional-work-hours'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Patch,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  EditProfessionalWorkHoursBodySchema,
  editProfessionalWorkHoursBodySchema,
} from './dto/edit-professional-work-hours.dto'

@Controller('me')
export class EditProfessionalWorkHoursController {
  constructor(
    private readonly editProfessionalWorkHours: ChangeProfessionalWorkHoursUseCase,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  @Patch('/professional/work-hours')
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(editProfessionalWorkHoursBodySchema))
    body: EditProfessionalWorkHoursBodySchema,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const { newStartHour, newEndHour } = body

    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new NotFoundException()
    }

    const result = await this.editProfessionalWorkHours.execute({
      professionalId: professional.id.toString(),
      newStartHour,
      newEndHour,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    console.log(JSON.stringify(result))

    return { professional: result.value.scheduleConfiguration }
  }
}
