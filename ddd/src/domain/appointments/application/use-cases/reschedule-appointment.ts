import type { Either } from '@src/core/either'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'

export interface RescheduleAppointmentUseCaseProps {
  id: string
  startDateTime: Date
  endDateTime: Date
}

export type RescheduleAppointmentUseCaseResponse = Either<
  null,
  {
    appointment: Appointment
  }
>

export class RescheduleAppointmentUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}
}
