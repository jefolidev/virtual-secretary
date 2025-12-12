import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ConflictError } from '@/domain/organization/application/use-cases/conflict-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { CreateCancellationPolicyUseCase } from '@/domain/scheduling/application/use-cases/create-cancellation-policy'
import { ValidationError } from '@/domain/scheduling/application/use-cases/errors/validation-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  createCancellationPolicyBodySchema,
  CreateCancellationPolicyBodySchema,
} from './dto/create-cancellation-policy.dto'

@Controller('/profissional/cancellation-policy')
export class CreateCancellationPolicyController {
  constructor(
    private readonly createCancellationPolicyUseCase: CreateCancellationPolicyUseCase,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createCancellationPolicyBodySchema))
    body: CreateCancellationPolicyBodySchema,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const {
      allowReschedule,
      cancelationFeePercentage,
      minDaysBeforeNextAppointment,
      minHoursBeforeCancellation,
      description,
    } = body

    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new NotFoundException()
    }

    const result = await this.createCancellationPolicyUseCase.execute({
      professionalId: professional.id.toString(),
      allowReschedule,
      cancelationFeePercentage,
      minDaysBeforeNextAppointment,
      minHoursBeforeCancellation,
      description,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ConflictError:
          throw new ConflictException(error.message)
        case NotFoundError:
          throw new NotFoundException(error.message)
        case ValidationError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const cancellationPolicy = result.value.cancellationPolicy

    return {
      cancellation_policy: cancellationPolicy,
    }
  }
}
