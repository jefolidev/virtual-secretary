import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Client,
  type ClientProps,
} from '@/domain/appointments/enterprise/entities/client'
import { faker } from '@faker-js/faker'

export function makeClient(
  override?: Partial<ClientProps>,
  id?: UniqueEntityId
) {
  const client: Client = Client.create(
    {
      userId: new UniqueEntityId(),
      name: faker.person.firstName(),
      phone: faker.phone.number(),
      appointmentHistory: [],
      extraPreferences: 'Nenhuma',
      periodPreference: [],
      ...override,
    },
    id
  )

  return client
}
