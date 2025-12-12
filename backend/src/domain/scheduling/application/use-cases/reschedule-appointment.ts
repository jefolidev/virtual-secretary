import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { NotAllowedError } from '../../../../core/errors/not-allowed-error'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { Appointment } from '../../enterprise/entities/appointment'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import { ClientRepository } from '../repositories/client.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
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

@Injectable()
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
    const appointment = await this.appointmentsRepository.findById(id)

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    if (appointment.status !== 'SCHEDULED') {
      return left(
        new NotAllowedError('Only scheduled appointments can be rescheduled')
      )
    }

    if (dayjs(startDateTime).isBefore(dayjs())) {
      return left(new NoDisponibilityError('Cannot reschedule to past date'))
    }

    if (dayjs(startDateTime).isAfter(endDateTime)) {
      return left(
        new NoDisponibilityError('Start date must be before end date')
      )
    }

    const client = await this.clientRepository.findById(
      appointment.clientId.toString()
    )

    if (!client) {
      return left(new NotFoundError('Client not found'))
    }

    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString()
    )

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    const professionalCancellationPolicy =
      await this.cancellationPollicyRepository.findByProfessionalId(
        professional.id.toString()
      )

    if (!professionalCancellationPolicy?.allowReschedule) {
      return left(new NotAllowedError('Professional does not allow reschedule'))
    }

    const overlappingAppointments =
      await this.appointmentsRepository.findOverlapping(
        professional.id.toString(),
        startDateTime,
        endDateTime
      )

    if (overlappingAppointments && overlappingAppointments.length > 0) {
      return left(new NoDisponibilityError('Time slot is not available'))
    }

    const rescheduleDateTime = {
      start: startDateTime,
      end: endDateTime,
    }

    appointment.reschedule(rescheduleDateTime)

    await this.appointmentsRepository.save(appointment)

    return right({
      appointment,
    })
  }
}
