import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { PaginationParams } from '@/core/repositories/pagination-params'
import type { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import type { Client } from '@/domain/scheduling/enterprise/entities/client'

export class InMemoryClientRepository implements ClientRepository {
  public items: Client[] = []

  async create(client: Client): Promise<void> {
    await this.items.push(client)
  }

  async findByUserId(userId: string): Promise<Client | null> {
    const client = await this.items.find(
      (client) =>
        client.userId !== undefined &&
        client.userId.equals(new UniqueEntityId(userId))
    )

    return client ?? null
  }

  async findMany(params: PaginationParams = { page: 1 }): Promise<Client[]> {
    return await this.items.slice((params.page - 1) * 10, params.page * 10)
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
