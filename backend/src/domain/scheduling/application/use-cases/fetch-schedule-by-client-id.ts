import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { Appointment } from '../../enterprise/entities/appointment'
import { AppointmentsRepository } from '../repositories/appointments.repository'

export interface FetchScheduleByClientIdUseCaseProps {
  clientId: string
  page?: number
}

type FetchScheduleByClientIdUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] | [] }
>

@Injectable()
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
