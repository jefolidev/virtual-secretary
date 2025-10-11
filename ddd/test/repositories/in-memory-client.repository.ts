import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { ClientRepository } from '@src/domain/appointments/application/repositories/client.repository'
import type { Client } from '@src/domain/appointments/enterprise/entities/client'

export class InMemoryClientRepository implements ClientRepository {
  public items: Client[] = []

  async create(client: Client): Promise<void> {
    await this.items.push(client)
  }

  async findMany(): Promise<Client[]> {
    return await this.items
  }

  async findById(id: UniqueEntityId): Promise<Client | null> {
    const client = await this.items.find((client) => client.id.equals(id))

    return client ?? null
  }

  async save(client: Client): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === client.id)

    this.items[itemIndex] = client
  }
}
