import { type Either, right } from '@src/core/either'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { NotFoundError } from './errors/resource-not-found-error'

type FetchScheduleUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] | [] }
>

export class FetchScheduleUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute(): Promise<FetchScheduleUseCaseResponse> {
    const appointments = await this.appointmentsRepository.findMany()

    return right({ appointments })
  }
}
