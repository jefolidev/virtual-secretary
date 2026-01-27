import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CancellationPolicy } from '@/domain/scheduling/enterprise/entities/cancellation-policy'
import { CancellationPolicy as PrismaCancellationPolicy } from '../../../generated/prisma'

export class PrismaCancellationPolicyMapper {
  static toPrisma(cancellationPoliy: CancellationPolicy) {
    return {
      id: cancellationPoliy.id.toString(),
      allowReschedule: cancellationPoliy.allowReschedule,
      cancellationFeePercentage: cancellationPoliy.cancelationFeePercentage,
      description: cancellationPoliy.description,
      minDaysBeforeNextAppointment:
        cancellationPoliy.minDaysBeforeNextAppointment,
      createdAt: cancellationPoliy.createdAt,
      minHoursBeforeCancellation: cancellationPoliy.minHoursBeforeCancellation,
      professionalId: cancellationPoliy.professionalId,
      updatedAt: cancellationPoliy.updatedAt,
    }
  }

  static toDomain(raw: PrismaCancellationPolicy): CancellationPolicy {
    if (!raw.professionalId) {
      throw new Error('Professional Id not provided')
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
      new UniqueEntityId(raw.id),
    )
  }
}
