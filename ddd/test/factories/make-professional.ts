import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Professional,
  type ProfessionalProps,
} from '@/domain/appointments/enterprise/entities/professional'
import { faker } from '@faker-js/faker'

export function makeProfessional(
  override?: Partial<ProfessionalProps>,
  id?: UniqueEntityId
) {
  const professional: Professional = Professional.create(
    {
      userId: new UniqueEntityId(),
      name: faker.person.firstName(),
      phone: faker.phone.number(),
      cancellationPolicyId: new UniqueEntityId(),
      notificationSettingsId: new UniqueEntityId(),
      officeAddress: faker.location.streetAddress(),
      ...override,
    },
    id
  )

  return professional
}
