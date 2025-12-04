import { Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Client,
  type PeriodPreferenceType,
} from '../../enterprise/entities/client'
import type { ClientRepository } from '../repositories/client.repository'

export interface CreateClientUseCaseProps {
  name: string
  phone: string
  periodPreference: PeriodPreferenceType[]
  extraPreferences?: string
}

type CreateClientUseCaseResponse = Either<unknown, { client: Client }>

export class CreateClietUseCase {
  constructor(private clientsRepository: ClientRepository) {}

  async execute({
    name,
    periodPreference,
    phone,
    extraPreferences,
  }: CreateClientUseCaseProps): Promise<CreateClientUseCaseResponse> {
    const client = await Client.create({
      userId: new UniqueEntityId(),
      name,
      periodPreference,
      phone,
      extraPreferences,
      appointmentHistory: [],
    })

    await this.clientsRepository.create(client)

    return right({ client })
  }
}
