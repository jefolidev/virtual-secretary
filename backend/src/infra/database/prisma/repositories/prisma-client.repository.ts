import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { Client } from '@/domain/scheduling/enterprise/entities/client'

class PrismaClientRepository implements ClientRepository {
  create(client: Client): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<Client[]> {
    throw new Error('Method not implemented.')
  }
  findById(id: UniqueEntityId): Promise<Client | null> {
    throw new Error('Method not implemented.')
  }
  save(client: Client): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
