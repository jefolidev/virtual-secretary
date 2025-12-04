import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import dayjs from 'dayjs'
import { NotAllowedError } from '../../../../core/errors/not-allowed-error'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import type { ClientRepository } from '../repositories/client.repository'
import type { ProfessionalRepository } from '../repositories/professional.repository'
import { NoDisponibilityError } from './errors/no-disponibility-error'

export interface RescheduleAppointmentUseCaseProps {
  id: string
  startDateTime: Date
  endDateTime: Date
}

export type RescheduleAppointmentUseCaseResponse = Either<
  NotFoundError | NoDisponibilityError | NotAllowedError,
  {
    appointment: Appointment
  }
>

export class RescheduleAppointmentUseCase {
  constructor(
    private appointmentsRepository: AppointmentsRepository,
    private professionalRepository: ProfessionalRepository,
    private cancellationPollicyRepository: CancellationPolicyRepository,
    private clientRepository: ClientRepository
  ) {}

  async execute({
    id,
    startDateTime,
    endDateTime,
  }: RescheduleAppointmentUseCaseProps): Promise<RescheduleAppointmentUseCaseResponse> {
    const appointment = await this.appointmentsRepository.findById(
      new UniqueEntityId(id)
    )

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    if (appointment.status !== 'SCHEDULED') {
      return left(new NoDisponibilityError('Appointment not scheduled'))
    }

    if (dayjs(startDateTime).isBefore(appointment.startDateTime)) {
      return left(
        new NoDisponibilityError('Reschedule start must be after start')
      )
    }

    if (dayjs(endDateTime).isBefore(appointment.startDateTime)) {
      return left(
        new NoDisponibilityError('Reschedule end must be after start')
      )
    }

    const client = await this.clientRepository.findById(appointment.clientId)

    if (!client) {
      return left(new NotFoundError('Client not found'))
    }

    if (client.id !== appointment.clientId) {
      return left(
        new NotAllowedError(
          'You are not allowed to reschedule this appointment'
        )
      )
    }

    const professional = await this.professionalRepository.findById(
      appointment.professionalId
    )

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    const professionalCancellationPolicy =
      await this.cancellationPollicyRepository.findByProfessionalId(
        professional.id
      )

    if (!professionalCancellationPolicy?.allowReschedule) {
      appointment.status = 'SCHEDULED'
      return left(new NoDisponibilityError('Professional not allow reschedule'))
    }

    const overlappingAppointments =
      await this.appointmentsRepository.findOverlapping(
        professional.id,
        startDateTime,
        endDateTime
      )

    if (overlappingAppointments!.length > 0) {
      return left(new NoDisponibilityError('Overlapping appointments'))
    }

    if (dayjs(startDateTime).isAfter(endDateTime)) {
      throw new Error('Reschedule start must be before end')
    }

    const rescheduleDateTime = {
      start: startDateTime,
      end: endDateTime,
    }

    await appointment.reschedule(rescheduleDateTime)

    await this.appointmentsRepository.save(appointment)

    return right({
      appointment,
    })
  }
}
