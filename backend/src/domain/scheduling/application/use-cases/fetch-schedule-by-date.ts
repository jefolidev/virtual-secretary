import { Either, left, right } from '@/core/either'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import { ValidationError } from './errors/validation-error'

export interface FetchScheduleByDateUseCaseProps {
  startDate: Date
  endDate: Date
  page?: number
}

export type FetchScheduleByDateUseCaseResponse = Either<
  ValidationError,
  { appointments: Appointment[] | null }
>

export class FetchScheduleByDateUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    startDate,
    endDate,
    page = 1,
  }: FetchScheduleByDateUseCaseProps): Promise<FetchScheduleByDateUseCaseResponse> {
    if (!startDate || !endDate)
      return left(new ValidationError('Please provide date.'))

    const appointments = await this.appointmentsRepository.findManyByDate(
      startDate,
      endDate,
      { page }
    )

    if (startDate >= endDate)
      return left(new ValidationError('Start date must be before end date.'))

    return right({ appointments })
  }
}
