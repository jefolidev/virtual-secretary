import { right, type Either } from '@/core/either'
import type { Client } from '../../enterprise/entities/client'
import type { ClientRepository } from '../repositories/client.repository'

export interface FetchClientUseCaseProps {}

export type FetchClientUseCaseResponse = Either<{}, { clients: Client[] }>

export class FetchClientUseCase {
  constructor(private clientsRepository: ClientRepository) {}

  async execute({}: FetchClientUseCaseProps): Promise<FetchClientUseCaseResponse> {
    const clients = await this.clientsRepository.findMany()

    return right({ clients })
  }
}
