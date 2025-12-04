import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'
import type { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import type { ProfessionalRepository } from '../repositories/professional.repository'
import { ValidationError } from './errors/validation-error'

interface CreateCancellationPolicyUseCaseProps {
  professionalId: string
  minHoursBeforeCancellation: number
  cancelationFeePercentage: number
  minDaysBeforeNextAppointment: number
  allowReschedule: boolean
  description: string
}

type CreateCancellationPolicyUseCaseResponse = Either<
  NotFoundError | ValidationError,
  {
    cancellationPolicy: CancellationPolicy
  }
>

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
      new UniqueEntityId(professionalId)
    )

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
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
      description,
      minDaysBeforeNextAppointment,
    })

    this.cancellationPolicyRepository.create(cancellationPolicy)

    return right({ cancellationPolicy })
  }
}
