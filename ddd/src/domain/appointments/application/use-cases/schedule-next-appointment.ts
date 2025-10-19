import dayjs from 'dayjs'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import type { ClientRepository } from '../repositories/client.repository'
import type { ProfessionalRepository } from '../repositories/professional-repository'
import { type Either, left, right } from './../../../../core/either'
import { UniqueEntityId } from './../../../../core/entities/unique-entity-id'
import { NoDisponibilityError } from './errors/no-disponibility-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { NotFoundError } from './errors/resource-not-found-error'

export interface ScheduleNextAppointmentUseCaseProps {
  professionalId: string
  clientId: string
  startDateTime: Date
  endDateTime: Date
}

export type ScheduleNextAppointmentUseCaseResponse = Either<
  NotFoundError | NotAllowedError | NoDisponibilityError,
  { appointment: Appointment }
>

export class ScheduleNextAppointmentUseCase {
  constructor(
    private appointmentsRepository: AppointmentsRepository,
    private clientRepository: ClientRepository,
    private professionalRepository: ProfessionalRepository,
    private cancellationPolicy: CancellationPolicyRepository
  ) {}

  async execute({
    clientId,
    professionalId,
    startDateTime,
    endDateTime,
  }: ScheduleNextAppointmentUseCaseProps): Promise<ScheduleNextAppointmentUseCaseResponse> {
    const client = await this.clientRepository.findById(
      new UniqueEntityId(clientId)
    )

    if (!client) return left(new NotFoundError('Client not found'))

    const professional = await this.professionalRepository.findById(
      new UniqueEntityId(professionalId)
    )

    if (!professional) return left(new NotFoundError('Professional not found'))

    const professionalCancellationPolicy =
      await this.cancellationPolicy.findByProfessionalId(
        new UniqueEntityId(professionalId)
      )

    if (!professionalCancellationPolicy) {
      return left(
        new NotFoundError('Cancellation policy not found for this professional')
      )
    }

    const clientAppointments =
      await this.appointmentsRepository.findManyByClientId(
        new UniqueEntityId(clientId)
      )

    if (clientAppointments.length === 0) {
      return left(new NotFoundError('This cliente has no appointments yet.'))
    }

    const lastFinishedAppointment = clientAppointments.find(
      (appointment) => appointment.status === 'COMPLETED'
    )

    if (!lastFinishedAppointment) {
      return left(
        new NotFoundError('This cliente has no finished appointments.')
      )
    }

    const minDaysGap =
      professionalCancellationPolicy.minDaysBeforeNextAppointment
    const nextAllowedDate = dayjs(lastFinishedAppointment.endDateTime).add(
      minDaysGap,
      'day'
    )

    if (dayjs(startDateTime).isBefore(nextAllowedDate)) {
      return left(
        new NotAllowedError(
          `You can only schedule a new session after ${nextAllowedDate.format('DD/MM/YYYY')}`
        )
      )
    }

    const overlappingAppointments =
      await this.appointmentsRepository.findOverlapping(
        new UniqueEntityId(professionalId),
        startDateTime,
        endDateTime
      )

    if (overlappingAppointments.length > 0) {
      return left(new NoDisponibilityError('Overlapping appointments'))
    }

    return right({ appointment: lastFinishedAppointment })
  }
}
