import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'

export interface DeleteCalendarEventUseCaseRequest {
  eventId: string
}

export type DeleteCalendarEventUseCaseResponse = Either<NotFoundError, void>

@Injectable()
export class DeleteCalendarEventUseCase {
  constructor(
    private googleCalendarEventRepository: GoogleCalendarEventRepository,
    private appointmentRepository: AppointmentsRepository,
  ) {}

  async execute({
    eventId,
  }: DeleteCalendarEventUseCaseRequest): Promise<DeleteCalendarEventUseCaseResponse> {
    await this.googleCalendarEventRepository.delete(eventId)

    const appointment =
      await this.appointmentRepository.findByGoogleEventId(eventId)

    if (appointment) {
      appointment.status = 'CANCELLED'
      return right(await this.appointmentRepository.save(appointment))
    }

    return left(new NotFoundError('Appointment not found'))
  }
}
