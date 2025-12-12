import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'
import { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ConflictError } from './errors/conflict-error'
import { ValidationError } from './errors/validation-error'

interface CreateCancellationPolicyUseCaseProps {
  professionalId: string
  minHoursBeforeCancellation: number
  cancelationFeePercentage: number
  minDaysBeforeNextAppointment: number
  allowReschedule: boolean
  description?: string
}

type CreateCancellationPolicyUseCaseResponse = Either<
  NotFoundError | ValidationError,
  {
    cancellationPolicy: CancellationPolicy
  }
>

@Injectable()
export class CreateCancellationPolicyUseCase {
  constructor(
    readonly cancellationPolicyRepository: CancellationPolicyRepository,
    readonly professionalRepository: ProfessionalRepository
  ) {}

  async execute({
    professionalId,
    minHoursBeforeCancellation,
    cancelationFeePercentage,
    allowReschedule,
    minDaysBeforeNextAppointment,
    description,
  }: CreateCancellationPolicyUseCaseProps): Promise<CreateCancellationPolicyUseCaseResponse> {
    const professional = await this.professionalRepository.findById(
      professionalId
    )

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    if (professional.cancellationPolicyId) {
      return left(
        new ConflictError(
          'This professional already have a cancellation policy.'
        )
      )
    }

    if (cancelationFeePercentage < 0) {
      return left(
        new ValidationError('cancelationFeePercentage must be greater than 0')
      )
    }

    if (minHoursBeforeCancellation < 3) {
      return left(new ValidationError('The minimun hours to cancell is three.'))
    }

    const cancellationPolicy = CancellationPolicy.create({
      professionalId: professional.id,
      minHoursBeforeCancellation,
      cancelationFeePercentage,
      allowReschedule,
      description: description ? description : '',
      minDaysBeforeNextAppointment,
    })

    await this.cancellationPolicyRepository.create(cancellationPolicy)

    professional.cancellationPolicyId = cancellationPolicy.id

    await this.professionalRepository.save(professional)

    return right({ cancellationPolicy })
  }
}
