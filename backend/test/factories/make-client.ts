import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Client,
  type ClientProps,
} from '@/domain/scheduling/enterprise/entities/client'
import { faker } from '@faker-js/faker'

export function makeClient(
  override?: Partial<ClientProps>,
  id?: UniqueEntityId,
) {
  const client: Client = Client.create(
    {
      userId: new UniqueEntityId(),
      name: faker.person.firstName(),
      whatsappNumber: faker.whatsappNumber.number(),
      appointmentHistory: [],
      extraPreferences: 'Nenhuma',
      periodPreference: [],
      ...override,
    },
    id,
  )

  return client
}
