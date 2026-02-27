import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { GoogleNotConnectedError } from '@/core/errors/google-not-connected'
import { InvalidGrantError } from '@/core/errors/invalid-grand-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { UserRepository } from '../repositories/user.repository'

export interface CreateCalendarEventUseCaseRequest {
  appointmentId: string
}

export type CreateCalendarEventUseCaseResponse = Either<
  NotFoundError | InvalidGrantError,
  { eventId: string; eventLink: string; meetLink?: string }
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

    const hasGoogleConnected =
      await this.googleCalendarTokenRepository.hasTokens(
        appointment.professionalId.toString(),
      )

    // ← was fetched but never used before
    if (!hasGoogleConnected) {
      return left(new GoogleNotConnectedError())
    }

    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString(),
    )

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    if (professional.googleConnectionStatus !== 'CONNECTED') {
      return left(new GoogleNotConnectedError())
    }

    const user = await this.userRepository.findByClientId(
      appointment.clientId.toString(),
    )

    if (!user) {
      return left(new NotFoundError('User not found'))
    }

    const eventDescription = `
Consulta agendada com ${user.name}

⚠️ IMPORTANTE: 
${
  appointment.modality === 'ONLINE'
    ? `
- O link do Google Meet estará disponível apenas no dia ${appointment.startDateTime.toLocaleDateString('pt-BR')}
- Acesso será liberado 15 minutos antes do horário agendado
`
    : ''
}

📅 Data: ${appointment.startDateTime.toLocaleString('pt-BR')}
📍 Modalidade: ${appointment.modality === 'ONLINE' ? 'Online (Google Meet)' : 'Presencial'}
`

    const event = GoogleCalendarEvent.create(
      {
        professionalId: appointment.professionalId,
        summary: `Consulta com o(a) paciente ${user.name}.`,
        startDateTime: appointment.startDateTime,
        endDateTime: appointment.endDateTime,
        appointmentId: new UniqueEntityId(appointmentId),
        description: eventDescription,
        googleEventLink: '',
        syncStatus: 'PENDING',
      },
      new UniqueEntityId(appointmentId),
    )

    let repositoryEvent: { id: string; htmlLink: string; meetLink?: string }

    try {
      repositoryEvent = await this.googleCalendarEventRepository.create(
        appointmentId,
        event,
      )
    } catch (error) {
      if (error instanceof InvalidGrantError) {
        return left(error)
      }
      throw error
    }

    event.googleEventLink = repositoryEvent.htmlLink

    await this.googleCalendarEventRepository.updateEvent(
      appointment.professionalId.toString(),
      event.id.toString(),
      {
        googleEventLink: event.googleEventLink,
        syncStatus: 'SYNCED',
        googleMeetLink: repositoryEvent.meetLink,
      },
    )

    appointment.googleCalendarEventId = event.id.toString()

    if (repositoryEvent.meetLink && appointment.modality === 'ONLINE') {
      appointment.googleMeetLink = repositoryEvent.meetLink
    }

    await this.googleCalendarEventRepository.updateEvent(
      appointment.professionalId.toString(),
      repositoryEvent.id.toString(),
      { googleEventLink: event.googleEventLink, syncStatus: 'SYNCED' },
    )

    appointment.googleCalendarEventId = repositoryEvent.id.toString()

    await this.appointmentRepository.save(appointment)

    return right({
      eventId: repositoryEvent.id.toString(),
      eventLink: event.googleEventLink,
      meetLink: repositoryEvent.meetLink,
    })
  }
}
