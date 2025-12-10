import { Either, right } from '@/core/either'
import type { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'

export interface FetchScheduleByProfessionalIdUseCaseProps {
  professionalId: string
  page?: number
}

type FetchScheduleByProfessionalIdUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] }
>

export class FetchScheduleByProfessionalIdUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    professionalId,
    page = 1,
  }: FetchScheduleByProfessionalIdUseCaseProps): Promise<FetchScheduleByProfessionalIdUseCaseResponse> {
    const appointments =
      await this.appointmentsRepository.findManyByProfessionalId(
        professionalId,
        { page }
      )

    return right({ appointments })
  }
}
