import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { Client } from '@/domain/scheduling/enterprise/entities/client'
import { Injectable } from '@nestjs/common'

@Injectable({})
export class PrismaClientRepository implements ClientRepository {
  create(client: Client): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<Client[]> {
    throw new Error('Method not implemented.')
  }
  findById(id: string): Promise<Client | null> {
    throw new Error('Method not implemented.')
  }
  save(client: Client): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
