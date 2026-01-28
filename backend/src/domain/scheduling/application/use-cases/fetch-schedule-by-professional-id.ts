import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { AppointmentWithClient } from '../../enterprise/entities/value-objects/appointment-with-client'
import { AppointmentsRepository } from '../repositories/appointments.repository'

export interface FetchScheduleByProfessionalIdUseCaseProps {
  professionalId: string
  page?: number
}

type FetchScheduleByProfessionalIdUseCaseResponse = Either<
  NotFoundError,
  { appointments: AppointmentWithClient[] }
>

@Injectable()
export class FetchScheduleByProfessionalIdUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    professionalId,
    page = 1,
  }: FetchScheduleByProfessionalIdUseCaseProps): Promise<FetchScheduleByProfessionalIdUseCaseResponse> {
    const appointments =
      await this.appointmentsRepository.findManyByProfessionalId(
        professionalId,
        { page },
      )

    return right({ appointments })
  }
}
