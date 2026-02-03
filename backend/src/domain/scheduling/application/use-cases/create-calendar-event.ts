import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'
import { UserRepository } from '../repositories/user.repository'

export interface CreateCalendarEventUseCaseRequest {
  appointmentId: string
}

export type CreateCalendarEventUseCaseResponse = Either<
  NotFoundError,
  { eventId: string; eventLink: string }
>

@Injectable()
export class CreateCalendarEventUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentsRepository,
    private readonly googleCalendarEventRepository: GoogleCalendarEventRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    appointmentId,
  }: CreateCalendarEventUseCaseRequest): Promise<CreateCalendarEventUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    const user = await this.userRepository.findByClientId(
      appointment.clientId.toString(),
    )

    if (!user) {
      return left(new NotFoundError('User not found'))
    }

    const event = GoogleCalendarEvent.create({
      professionalId: appointment.professionalId,
      summary: `Consulta com o(a) paciente ${user.name}.`,
      startDateTime: appointment.startDateTime,
      endDateTime: appointment.endDateTime,
      appointmentId: new UniqueEntityId(appointmentId),
      description: `Consulta agendada para o(a) paciente ${user.name}.`,
      googleEventLink: '',
      syncStatus: 'PENDING',
    })

    await this.googleCalendarEventRepository.create(appointmentId, event)

    appointment.googleCalendarEventId = event.id.toString()

    await this.appointmentRepository.save(appointment)

    return right({
      eventId: event.id.toString(),
      eventLink: event.googleEventLink,
    })
  }
}
