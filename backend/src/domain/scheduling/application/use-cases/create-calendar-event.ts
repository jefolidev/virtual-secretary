import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { UserRepository } from '../repositories/user.repository'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'

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
    private readonly professionalRepository: ProfessionalRepository,
    private readonly googleCalendarEventRepository: GoogleCalendarEventRepository,
    private readonly googleCalendarTokenRepository: GoogleCalendarTokenRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    appointmentId,
  }: CreateCalendarEventUseCaseRequest): Promise<CreateCalendarEventUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    // 2. Verificar se profissional tem Google Calendar conectado
    const hasGoogleConnected =
      await this.googleCalendarTokenRepository.hasTokens(
        appointment.professionalId.toString(),
      )

    if (!hasGoogleConnected) {
      return left(
        new Error(
          `Professional ${appointment.professionalId.toString()} has not connected Google Calendar`,
        ),
      )
    }

    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString(),
    )

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
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

    const repositoryEvent = await this.googleCalendarEventRepository.create(
      appointmentId,
      event,
    )

    event.googleEventLink = repositoryEvent.htmlLink

    await this.googleCalendarEventRepository.updateEvent(
      appointment.professionalId.toString(),
      event.id.toString(),
      { googleEventLink: event.googleEventLink, syncStatus: 'SYNCED' },
    )

    appointment.googleCalendarEventId = event.id.toString()

    await this.appointmentRepository.save(appointment)

    return right({
      eventId: event.id.toString(),
      eventLink: event.googleEventLink,
    })
  }
}
