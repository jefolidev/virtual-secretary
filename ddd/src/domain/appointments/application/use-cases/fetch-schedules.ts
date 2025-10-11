import { type Either, right } from '@src/core/either'
import type {
  Appointment,
  AppointmentStatusType,
} from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { NotFoundError } from './errors/resource-not-found-error'

type FetchScheuleUseCaseProps = {
  status?: AppointmentStatusType
}

type FetchScheduleUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] }
>

export class FetchScheduleUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    status,
  }: FetchScheuleUseCaseProps): Promise<FetchScheduleUseCaseResponse> {
    const appointments = await this.appointmentsRepository.findMany()

    return right({ appointments })
  }
}
