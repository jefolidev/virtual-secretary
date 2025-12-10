import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Client } from '../../enterprise/entities/client'
import { ClientRepository } from '../repositories/client.repository'

export interface FetchClientsUseCaseRequest {
  page: number
}

export type FetchClientsUseCaseResponse = Either<
  undefined,
  { clients: Client[] }
>

@Injectable()
export class FetchClientsUseCase {
  constructor(private clientsRepository: ClientRepository) {}

  async execute({
    page = 1,
  }: FetchClientsUseCaseRequest): Promise<FetchClientsUseCaseResponse> {
    const clients = await this.clientsRepository.findMany({ page })

    return right({ clients })
  }
}
