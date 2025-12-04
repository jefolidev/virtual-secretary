import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CancellationPolicy } from '@/domain/scheduling/enterprise/entities/cancellation-policy'
import { CancellationPolicy as PrismaCancellationPolicy } from '@prisma/generated/client'

export class PrismaCancellationPolicyMapper {
  static toDomain(raw: PrismaCancellationPolicy): CancellationPolicy {
    if (!raw.professionalId) {
      throw new Error('Something is wrong with professional Id')
    }

    return CancellationPolicy.create(
      {
        allowReschedule: raw.allowReschedule,
        cancelationFeePercentage: Number(raw.cancellationFeePercentage),
        description: raw.description,
        minDaysBeforeNextAppointment: raw.minDaysBeforeNextAppointment,
        createdAt: raw.createdAt,
        minHoursBeforeCancellation: raw.minHoursBeforeCancellation,
        professionalId: new UniqueEntityId(raw.professionalId),
        updatedAt: raw.updatedAt || null,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
