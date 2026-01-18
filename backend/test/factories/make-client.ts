import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Client,
  type ClientProps,
} from '@/domain/scheduling/enterprise/entities/client'

export function makeClient(
  override?: Partial<ClientProps>,
  id?: UniqueEntityId,
) {
  const client: Client = Client.create(
    {
      userId: new UniqueEntityId(),
      appointmentHistory: [],
      extraPreferences: 'Nenhuma',
      periodPreference: [],
      ...override,
    },
    id,
  )

  return client
}
