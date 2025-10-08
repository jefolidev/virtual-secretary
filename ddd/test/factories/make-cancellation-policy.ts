import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  CancellationPolicy,
  type CancellationPolicyProps,
} from '@/domain/appointments/enterprise/entities/cancellation-policy'
import { faker } from '@faker-js/faker'

export function makeCancellationPolicy(
  override?: Partial<CancellationPolicyProps>,
  id?: UniqueEntityId
) {
  const cancellationPolicy: CancellationPolicy = CancellationPolicy.create(
    {
      allowReschedule: true,
      cancelationFeePercentage: 0.5,
      description: faker.lorem.sentence(),
      minHoursBeforeCancellation: 3,
      professionalId: new UniqueEntityId(),
      ...override,
    },
    id
  )

  return cancellationPolicy
}
