import { Either, right } from '@/core/either'
import type { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'

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
      clientId.toString()
    )

    return right({ appointments })
  }
}
