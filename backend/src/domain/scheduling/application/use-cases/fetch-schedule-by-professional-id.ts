import { Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'

export interface FetchScheduleByProfessionalIdUseCaseProps {
  professionalId: string
}

type FetchScheduleByProfessionalIdUseCaseResponse = Either<
  NotFoundError,
  { appointments: Appointment[] }
>

export class FetchScheduleByProfessionalIdUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    professionalId,
  }: FetchScheduleByProfessionalIdUseCaseProps): Promise<FetchScheduleByProfessionalIdUseCaseResponse> {
    const appointments =
      await this.appointmentsRepository.findManyByProfessionalId(
        new UniqueEntityId(professionalId)
      )

    return right({ appointments })
  }
}
