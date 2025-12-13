import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { EditCancellationPolicyUseCase } from '@/domain/scheduling/application/use-cases/edit-cancellation-policy'
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
  EditCancellationPolicyBodySchema,
  editCancellationPolicyBodySchema,
} from './dto/edit-cancellation-policy.dto'

@Controller('profissional/cancellation-policy')
export class EditCancellationPolicyController {
  constructor(
    private readonly editCancellationPolicy: EditCancellationPolicyUseCase,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  @Put()
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(editCancellationPolicyBodySchema))
    body: EditCancellationPolicyBodySchema,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const {
      allowReschedule,
      cancelationFeePercentage,
      description,
      minDaysBeforeNextAppointment,
      minHoursBeforeCancellation,
    } = body

    const professional = await this.professionalRepository.findByUserId(userId)

    console.log(userId)
    console.log(professional)

    if (!professional) {
      throw new NotFoundException()
    }

    const result = await this.editCancellationPolicy.execute({
      professionalId: professional.id.toString(),
      allowReschedule,
      cancelationFeePercentage,
      description,
      minDaysBeforeNextAppointment,
      minHoursBeforeCancellation,
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

    return { cancellation_policy: result.value.cancellationPolicy }
  }
}
