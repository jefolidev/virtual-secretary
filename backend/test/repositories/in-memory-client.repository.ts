import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import type { Client } from '@/domain/scheduling/enterprise/entities/client'

export class InMemoryClientRepository implements ClientRepository {
  // async findByUserId(userId: string): Promise<Client | null> {
  //   const client = this.items.find((client) => client. === userId)
  //   return client ?? null
  // }
  public items: Client[] = []

  async create(client: Client): Promise<void> {
    await this.items.push(client)
  }

  async findMany(): Promise<Client[]> {
    return await this.items
  }

  async findById(id: string): Promise<Client | null> {
    const client = await this.items.find((client) =>
      client.id.equals(new UniqueEntityId(id))
    )

    return client ?? null
  }

  async save(client: Client): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.equals(client.id))

    this.items[itemIndex] = client
  }
}
