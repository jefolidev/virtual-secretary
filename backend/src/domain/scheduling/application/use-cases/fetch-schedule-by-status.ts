import { Either, right } from '@/core/either'
import type { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import type {
  Appointment,
  AppointmentStatusType,
} from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'

export interface FetchScheduleByStatusUseCaseProps {
  status: AppointmentStatusType
}

type FetchScheduleByStatusUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] }
>

export class FetchScheduleByStatusUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    status,
  }: FetchScheduleByStatusUseCaseProps): Promise<FetchScheduleByStatusUseCaseResponse> {
    const appointments = await this.appointmentsRepository.findManyByStatus(
      status
    )

    return right({ appointments })
  }
}
