import { type Either, right } from '@src/core/either'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { NotFoundError } from './errors/resource-not-found-error'

export interface FetchScheduleByClientIdUseCaseProps {
  clientId: string
}

type FetchScheduleByClientIdUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] | [] }
>

export class FetchScheduleByClientIdUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    clientId,
  }: FetchScheduleByClientIdUseCaseProps): Promise<FetchScheduleByClientIdUseCaseResponse> {
    const appointments = await this.appointmentsRepository.findManyByClientId(
      new UniqueEntityId(clientId)
    )

    return right({ appointments })
  }
}
