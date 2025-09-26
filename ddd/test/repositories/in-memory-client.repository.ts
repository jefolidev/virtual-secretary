import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ClientRepository } from '@/domain/appointments/application/repositories/client.repository'
import type { Client } from '@/domain/appointments/enterprise/entities/client'

export class InMemoryClientRepository implements ClientRepository {
  public items: Client[] = []

  async create(client: Client): Promise<void> {
    await this.items.push(client)
  }

  async findById(id: UniqueEntityId): Promise<Client | null> {
    const client = await this.items.find(
      (client) => client.id.toString() === id.toString()
    )

    return client ?? null
  }

  async save(client: Client): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === client.id)

    this.items[itemIndex] = client
  }
}
