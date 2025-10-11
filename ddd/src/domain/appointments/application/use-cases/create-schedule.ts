import { type Either, left, right } from '@src/core/either'
import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import {
  Appointment,
  type AppointmentModalityType,
} from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { ClientRepository } from '../repositories/client.repository'
import type { ProfessionalRepository } from '../repositories/professional-repository'
import { NoDisponibilityError } from './errors/no-disponibility-error'
import { NotFoundError } from './errors/resource-not-found-error'

interface CreateAppointmentUseCaseProps {
  clientId: UniqueEntityId
  professionalId: UniqueEntityId
  startDateTime: Date
  endDateTime: Date
  modality: AppointmentModalityType
  googleMeetLink?: string
  price: number
}

type CreateAppointmentUseCaseResponse = Either<
  NoDisponibilityError | NotFoundError,
  {
    appointment: Appointment
  }
>

export class CreateAppointmentUseCase {
  constructor(
    private appointmentsRepository: AppointmentsRepository,
    private clientsRepository: ClientRepository,
    private professionalRepository: ProfessionalRepository
  ) {}

  async execute({
    clientId,
    professionalId,
    startDateTime,
    endDateTime,
    modality,
    googleMeetLink,
  }: CreateAppointmentUseCaseProps): Promise<CreateAppointmentUseCaseResponse> {
    const client = await this.clientsRepository.findById(clientId)
    if (!client) {
      return left(new NotFoundError('Client not found'))
    }

    const professional =
      await this.professionalRepository.findById(professionalId)
    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    const overlappingAppointments =
      await this.appointmentsRepository.findOverlapping(
        professionalId,
        startDateTime,
        endDateTime
      )

    if (overlappingAppointments!.length > 0) {
      return left(new NoDisponibilityError('No disponibility'))
    }

    const appointment = Appointment.create({
      clientId,
      professionalId,
      startDateTime,
      endDateTime,
      modality,
      googleMeetLink,
      price: 100,
    })

    await this.appointmentsRepository.create(appointment)

    return right({ appointment })
  }
}
