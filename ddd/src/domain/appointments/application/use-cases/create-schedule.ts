import { type Either, left, right } from '@src/core/either'
import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import dayjs from 'dayjs'
import {
  Appointment,
  type AppointmentModalityType,
} from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { ClientRepository } from '../repositories/client.repository'
import type { ProfessionalRepository } from '../repositories/professional-repository'
import type { ScheduleConfigurationRepository } from './../repositories/schedule-configuration.repository'
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
    private professionalRepository: ProfessionalRepository,
    private scheduleConfigurationRepository: ScheduleConfigurationRepository
  ) {}

  async execute({
    clientId,
    professionalId,
    startDateTime,
    endDateTime,
    modality,
    googleMeetLink,
    price,
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

    const professionalScheduleConfiguration =
      await this.scheduleConfigurationRepository.findByProfessionalId(
        professionalId
      )

    if (!professionalScheduleConfiguration) {
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

    const scheduleDurationMinute =
      professionalScheduleConfiguration.sessionDurationMinutes
    const scheduleDurationDiff = dayjs(endDateTime).diff(
      dayjs(startDateTime),
      'minute'
    )

    if (scheduleDurationDiff < scheduleDurationMinute) {
      return left(
        new NoDisponibilityError(
          `Schedule duration must be at least ${scheduleDurationMinute} minutes`
        )
      )
    }

    const scheduleDiffInHours = dayjs(startDateTime).diff(dayjs(), 'hour', true)

    if (scheduleDiffInHours < 3) {
      return left(
        new NoDisponibilityError(
          'You can only reschedule at least 3 hours in advance.'
        )
      )
    }

    const appointment = Appointment.create({
      clientId,
      professionalId,
      startDateTime,
      endDateTime,
      modality,
      googleMeetLink,
      price,
    })

    await this.appointmentsRepository.create(appointment)

    return right({ appointment })
  }
}
