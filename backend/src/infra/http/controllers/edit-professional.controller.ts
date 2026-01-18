import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { EditProfessionalUseCase } from '@/domain/scheduling/application/use-cases/edit-professional'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Put,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  EditProfessionalBodySchema,
  editProfessionalBodySchema,
} from './dto/edit-professional.dto'

@Controller('me')
export class EditProfessionalController {
  constructor(
    private readonly editProfessional: EditProfessionalUseCase,
    private readonly professionalRepository: ProfessionalRepository,
  ) {}

  @Put('/professional')
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(editProfessionalBodySchema))
    body: EditProfessionalBodySchema,
    @CurrentUser() { sub: userId }: UserPayload,
  ) {
    const {
      dailySummaryTime,
      enabledTypes,
      reminderBeforeMinutes,
      sessionPrice,
    } = body

    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new NotFoundException()
    }

    const result = await this.editProfessional.execute({
      professionalId: professional.id.toString(),
      dailySummaryTime,
      enabledTypes,
      reminderBeforeMinutes,
      sessionPrice,
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

    return { professional: result.value.professional }
  }
}
