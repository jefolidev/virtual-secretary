import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import {
  Client,
  type PeriodPreferenceType,
} from '../../enterprise/entities/client'
import { ClientRepository } from '../repositories/client.repository'

export interface CreateClientUseCaseProps {
  periodPreference: PeriodPreferenceType[]
  extraPreferences?: string
}

type CreateClientUseCaseResponse = Either<unknown, { client: Client }>

@Injectable()
export class CreateClientUseCase {
  constructor(private clientsRepository: ClientRepository) {}

  async execute({
    periodPreference,
    extraPreferences,
  }: CreateClientUseCaseProps): Promise<CreateClientUseCaseResponse> {
    const client = Client.create({
      periodPreference,
      extraPreferences,
      appointmentHistory: [],
    })

    await this.clientsRepository.create(client)

    return right({ client })
  }
}
