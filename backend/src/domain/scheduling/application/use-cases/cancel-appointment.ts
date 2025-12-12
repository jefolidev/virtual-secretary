import { Either, left, right } from '@/core/either'
import dayjs from 'dayjs'
import { NotAllowedError } from '../../../../core/errors/not-allowed-error'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import type { ClientRepository } from '../repositories/client.repository'
import type { ProfessionalRepository } from '../repositories/professional.repository'
import { AlreadyCanceledError } from './errors/already-canceled-error'
import { CannotCancelAppointmentError } from './errors/cannot-cancel-appointment'

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
    const appointment = await this.appointmentsRepository.findById(id)

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    const client = await this.clientRepository.findById(
      appointment.clientId.toString()
    )
    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString()
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

    if (!professional.cancellationPolicyId) {
      return left(
        new NotFoundError('Professional not have cancellation policy yet.')
      )
    }

    const cancellationPolicyId = professional.cancellationPolicyId.toString()

    const cancellationPolicy = await this.cancellationPolicyRepository.findById(
      cancellationPolicyId
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

    // if (diffBetweenDates < minHoursBeforeCancellation) {
    //   // TODO: APLICAR O BOUNDED CONTEXT AQUI QUANDO POSSUIR DOMINIO DE PAYMENT
    //   appointment.price = (cancelationFeePercentage / 100) * appointment.price
    // }

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

    appointment.cancel()

    await this.appointmentsRepository.save(appointment)

    return right({ appointment })
  }
}
