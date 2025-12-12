import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import {
  Appointment,
  type AppointmentModalityType,
} from '../../enterprise/entities/appointment'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { ClientRepository } from '../repositories/client.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'
import { InvalidValueError } from './errors/invalid-value-error'
import { NoDisponibilityError } from './errors/no-disponibility-error'

interface CreateAppointmentUseCaseProps {
  clientId: string
  professionalId: string
  startDateTime: Date
  modality: AppointmentModalityType
  googleMeetLink?: string
}

type CreateAppointmentUseCaseResponse = Either<
  NoDisponibilityError | NotFoundError | InvalidValueError,
  {
    appointment: Appointment
  }
>

@Injectable()
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
    modality,
    googleMeetLink,
  }: CreateAppointmentUseCaseProps): Promise<CreateAppointmentUseCaseResponse> {
    const client = await this.clientsRepository.findById(clientId.toString())
    if (!client) {
      return left(new NotFoundError('Client not found'))
    }

    const professional = await this.professionalRepository.findById(
      professionalId.toString()
    )

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    const professionalScheduleConfiguration =
      await this.scheduleConfigurationRepository.findByProfessionalId(
        professionalId.toString()
      )

    if (!professionalScheduleConfiguration) {
      return left(
        new NotFoundError('Professional schedule configuration not found')
      )
    }

    const scheduleDurationMinute =
      professionalScheduleConfiguration.sessionDurationMinutes
      
    const scheduleDurationDiff = dayjs(startDateTime)
      .add(scheduleDurationMinute, 'minutes')
      .diff(dayjs(startDateTime), 'minute')

    const endScheduleTime = dayjs(startDateTime)
      .add(scheduleDurationMinute, 'minutes')
      .toDate()

    const overlappingAppointments =
      await this.appointmentsRepository.findOverlapping(
        professionalId.toString(),
        startDateTime,
        endScheduleTime
      )
      

    if (overlappingAppointments!.length > 0) {
      return left(new NoDisponibilityError('No disponibility'))
    }

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

    if (dayjs(endScheduleTime).isBefore(startDateTime)) {
      return left(
        new BadRequestError('End date cannot be before than start date.')
      )
    }

    const appointment = Appointment.create({
      clientId: new UniqueEntityId(clientId),
      professionalId: new UniqueEntityId(professionalId),
      startDateTime,
      endDateTime: endScheduleTime,
      modality,
      googleMeetLink,
      agreedPrice: professional.sessionPrice,
    })

    await this.appointmentsRepository.create(appointment)

    return right({ appointment })
  }
}
