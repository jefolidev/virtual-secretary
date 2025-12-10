import { Either, right } from '@/core/either'
import type { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'

export interface FetchScheduleByClientIdUseCaseProps {
  clientId: string
  page?: number
}

type FetchScheduleByClientIdUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] | [] }
>

export class FetchScheduleByClientIdUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    clientId,
    page = 1,
  }: FetchScheduleByClientIdUseCaseProps): Promise<FetchScheduleByClientIdUseCaseResponse> {
    const appointments = await this.appointmentsRepository.findManyByClientId(
      clientId.toString(),
      { page }
    )

    return right({ appointments })
  }
}
