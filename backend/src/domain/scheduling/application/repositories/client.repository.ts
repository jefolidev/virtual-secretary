import type { Client } from '../../enterprise/entities/client'

export abstract class ClientRepository {
  abstract create(client: Client): Promise<void>
  abstract findMany(): Promise<Client[]>
  abstract findByUserId(userId: string): Promise<Client | null>
  abstract findById(id: string): Promise<Client | null>
  abstract save(client: Client): Promise<void>
}
