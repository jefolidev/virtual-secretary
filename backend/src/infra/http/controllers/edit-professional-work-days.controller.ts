import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { ChangeProfessionalWorkDaysUseCase } from '@/domain/scheduling/application/use-cases/change-professional-work-days'
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
  editProfessionalWorkDaysBodySchema,
  EditProfessionalWorkDaysBodySchema,
} from './dto/edit-professional-work-days.dto'

@Controller('me')
export class EditProfessionalWorkDaysController {
  constructor(
    private readonly editProfessionalWorkDays: ChangeProfessionalWorkDaysUseCase,
    private readonly professionalRepository: ProfessionalRepository,
  ) {}

  @Patch('/professional/work-days')
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(editProfessionalWorkDaysBodySchema))
    body: EditProfessionalWorkDaysBodySchema,
    @CurrentUser() { sub: userId }: UserPayload,
  ) {
    const { newDays } = body

    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new NotFoundException()
    }

    const result = await this.editProfessionalWorkDays.execute({
      professionalId: professional.id.toString(),
      newDays,
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

    return { professional: result.value.scheduleConfiguration }
  }
}
