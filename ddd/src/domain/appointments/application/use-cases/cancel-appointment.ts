import { left, right, type Either } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import dayjs from 'dayjs'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import type { ClientRepository } from '../repositories/client.repository'
import type { ProfessionalRepository } from '../repositories/professional-repository'
import { AlreadyCanceledError } from './errors/already-canceled-error'
import { CannotCancelAppointmentError } from './errors/cannot-cancel-appointment'
import { NotAllowedError } from './errors/not-allowed-error'
import { NotFoundError } from './errors/resource-not-found-error'

export interface CancelAppointmentUseCaseProps {
  id: string
}

export type CancelAppointmentUseCaseResponse = Either<
  | NotFoundError
  | NotAllowedError
  | AlreadyCanceledError
  | CannotCancelAppointmentError,
  { appointment: Appointment }
>

export class CancelAppointmentUseCase {
  constructor(
    private appointmentsRepository: AppointmentsRepository,
    private professionalRepository: ProfessionalRepository,
    private cancellationPolicyRepository: CancellationPolicyRepository,
    private clientRepository: ClientRepository
  ) {}

  async execute({
    id,
  }: CancelAppointmentUseCaseProps): Promise<CancelAppointmentUseCaseResponse> {
    const appointment = await this.appointmentsRepository.findById(
      new UniqueEntityId(id)
    )

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    const client = await this.clientRepository.findById(appointment.clientId)
    const professional = await this.professionalRepository.findById(
      appointment.professionalId
    )

    if (!client) {
      return left(new NotFoundError('Client not found'))
    }

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    if (
      client?.id !== appointment.clientId ||
      professional?.id !== appointment.professionalId
    ) {
      return left(
        new NotAllowedError('You are not allowed to cancel this appointment')
      )
    }

    const cancellationPolicyId = professional.cancellationPolicyId.toString()

    const cancellationPolicy = await this.cancellationPolicyRepository.findById(
      new UniqueEntityId(cancellationPolicyId)
    )

    if (!cancellationPolicy) {
      return left(
        new NotAllowedError('Professional does not have a cancellation policy')
      )
    }

    const { minHoursBeforeCancellation, cancelationFeePercentage } =
      cancellationPolicy

    const diffBetweenDates = dayjs(appointment.startDateTime).diff(
      dayjs(new Date()),
      'hours'
    )

    if (diffBetweenDates < minHoursBeforeCancellation) {
      // TODO: APLICAR O BOUNDED CONTEXT AQUI QUANDO POSSUIR DOMINIO DE PAYMENT
      appointment.price = (cancelationFeePercentage / 100) * appointment.price
    }

    if (dayjs(appointment.startDateTime).isBefore(dayjs())) {
      return left(
        new CannotCancelAppointmentError('Cannot cancel a past appointment')
      )
    }

    if (
      appointment.status === 'CANCELLED' ||
      appointment.status === 'COMPLETED'
    ) {
      return left(new AlreadyCanceledError())
    }

    appointment.status = 'CANCELLED'

    await this.appointmentsRepository.save(appointment)

    return right({ appointment })
  }
}
