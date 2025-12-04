import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import type { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'
import type { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import type { ProfessionalRepository } from '../repositories/professional.repository'

export interface EditCancellationPolicyUseCaseRequest {
  professionalId: string
  minHoursBeforeCancellation?: number
  minDaysBeforeNextAppointment?: number
  cancelationFeePercentage?: number
  allowReschedule?: boolean
  description?: string
}

export type EditCancellationPolicyUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  {
    cancellationPolicy: CancellationPolicy
  }
>

export class EditCancellationPolicyUseCase {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private cancellationPolicyRepository: CancellationPolicyRepository
  ) {}

  async execute({
    professionalId,
    minHoursBeforeCancellation,
    minDaysBeforeNextAppointment,
    cancelationFeePercentage,
    allowReschedule,
    description,
  }: EditCancellationPolicyUseCaseRequest) {
    const professional = await this.professionalRepository.findById(
      new UniqueEntityId(professionalId)
    )

    if (!professional) return left(new NotFoundError('Professional not found.'))

    if (!professional.id.equals(new UniqueEntityId(professionalId))) {
      return left(new NotAllowedError())
    }

    const cancellationPolicy =
      await this.cancellationPolicyRepository.findByProfessionalId(
        new UniqueEntityId(professionalId)
      )

    if (!cancellationPolicy)
      return left(
        new NotFoundError('Cancellation policy could not be founded.')
      )

    if (!cancellationPolicy.professionalId.equals(professional.id))
      return left(new NotAllowedError())

    cancellationPolicy.minHoursBeforeCancellation =
      minHoursBeforeCancellation ??
      cancellationPolicy.minHoursBeforeCancellation
    cancellationPolicy.minDaysBeforeNextAppointment =
      minDaysBeforeNextAppointment ??
      cancellationPolicy.minDaysBeforeNextAppointment
    cancellationPolicy.cancelationFeePercentage =
      cancelationFeePercentage ?? cancellationPolicy.cancelationFeePercentage
    cancellationPolicy.allowReschedule =
      allowReschedule ?? cancellationPolicy.allowReschedule
    cancellationPolicy.description =
      description ?? cancellationPolicy.description

    await this.cancellationPolicyRepository.save(cancellationPolicy)

    return right({
      cancellationPolicy,
    })
  }
}
