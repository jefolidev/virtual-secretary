import { type Either, right } from '@src/core/either'
import type {
  Appointment,
  AppointmentStatusType,
} from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { NotFoundError } from './errors/resource-not-found-error'

export interface FetchScheduleByStatusUseCaseProps {
  status: AppointmentStatusType
}

type FetchScheduleByStatusUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] | [] }
>

export class FetchScheduleByStatusUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    status,
  }: FetchScheduleByStatusUseCaseProps): Promise<FetchScheduleByStatusUseCaseResponse> {
    const appointments =
      await this.appointmentsRepository.findManyByStatus(status)

    return right({ appointments })
  }
}
