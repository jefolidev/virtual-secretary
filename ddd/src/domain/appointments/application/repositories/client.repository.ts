import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Client } from '../../enterprise/entities/client'

export interface ClientRepository {
  create(client: Client): Promise<void>
  findById(id: UniqueEntityId): Promise<Client | null>
  save(client: Client): Promise<void>
}
