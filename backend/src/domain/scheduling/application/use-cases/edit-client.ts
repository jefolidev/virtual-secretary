import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { Client, PeriodPreferenceType } from '../../enterprise/entities/client'
import { ClientRepository } from '../repositories/client.repository'

export interface EditClientUseCaseRequest {
  clientId: string
  periodPreference?: PeriodPreferenceType[]
  extraPreferences?: string
}

export type EditClientUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  {
    client: Client
  }
>

@Injectable()
export class EditClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute({
    clientId,
    periodPreference,
    extraPreferences,
  }: EditClientUseCaseRequest): Promise<EditClientUseCaseResponse> {
    const client = await this.clientRepository.findById(clientId)

    if (!client) return left(new NotFoundError('Client not found.'))

    if (!client.id.equals(new UniqueEntityId(clientId))) {
      return left(new NotAllowedError())
    }

    client.extraPreferences = extraPreferences ?? client.extraPreferences
    client.periodPreference = periodPreference ?? client.periodPreference

    await this.clientRepository.save(client)

    return right({
      client,
    })
  }
}
