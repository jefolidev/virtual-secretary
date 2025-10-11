import { type Either, right } from '@src/core/either'
import type { Client } from '../../enterprise/entities/client'
import type { ClientRepository } from '../repositories/client.repository'

export type FetchClientUseCaseProps = {
  id?: string
}

export type FetchClientUseCaseResponse = Either<
  undefined,
  { clients: Client[] }
>

export class FetchClientUseCase {
  constructor(private clientsRepository: ClientRepository) {}

  async execute({
    id,
  }: FetchClientUseCaseProps): Promise<FetchClientUseCaseResponse> {
    const clients = await this.clientsRepository.findMany()

    return right({ clients })
  }
}
