import { right, type Either } from '@/core/either'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import { NotFoundError } from './errors/resource-not-found-error'

interface FetchScheuleUseCaseProps {}

type FetchScheduleUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] }
>

export class FetchScheduleUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({}: FetchScheuleUseCaseProps): Promise<FetchScheduleUseCaseResponse> {
    const appointments = await this.appointmentsRepository.findMany()

    return right({ appointments })
  }
}
