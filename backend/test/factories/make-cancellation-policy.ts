import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  CancellationPolicy,
  type CancellationPolicyProps,
} from '@/domain/scheduling/enterprise/entities/cancellation-policy'
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
      minDaysBeforeNextAppointment: 2,
      ...override,
    },
    id
  )

  return cancellationPolicy
}
