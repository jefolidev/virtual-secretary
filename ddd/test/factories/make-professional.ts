import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import {
  Professional,
  type ProfessionalProps,
} from '@src/domain/appointments/enterprise/entities/professional'

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
