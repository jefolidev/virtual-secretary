import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import {
  CancellationPolicy,
  type CancellationPolicyProps,
} from '@src/domain/scheduling/enterprise/entities/cancellation-policy'

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
