import { type Either, left, right } from '@src/core/either'
import { BadRequestError } from '@src/core/errors/bad-request'
import { NotAllowedError } from '@src/core/errors/not-allowed-error'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import { UniqueEntityId } from '../../../../core/entities/unique-entity-id'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { ClientRepository } from '../repositories/client.repository'
import type { ProfessionalRepository } from '../repositories/professional-repository'

export interface StartAppointmentUseCaseRequest {
  appointmentId: string
  professionalId: string
}

export type StartAppointmentUseCaseResponse = Either<
  NotAllowedError | NotFoundError | BadRequestError,
  {
    appointment: Appointment
  }
>

export class StartAppointmentUseCase {
  constructor(
    readonly appointmentsRepository: AppointmentsRepository,
    readonly clientRepository: ClientRepository,
    readonly professionalRepository: ProfessionalRepository
  ) {}

  async execute({
    appointmentId,
    professionalId,
  }: StartAppointmentUseCaseRequest) {
    const appointment = await this.appointmentsRepository.findById(
      new UniqueEntityId(appointmentId)
    )

    if (!appointment) return left(new NotFoundError('Appointment not found!'))

    const { clientId } = appointment

    const professional = await this.professionalRepository.findById(
      new UniqueEntityId(professionalId)
    )

    if (!professional) return left(new NotFoundError('Professional not found!'))

    const client = await this.clientRepository.findById(clientId)

    if (!client) return left(new NotFoundError('Client not found!'))

    if (!appointment.professionalId.equals(new UniqueEntityId(professionalId)))
      return left(
        new NotAllowedError(
          'You cannot start an appointment that is not yours.'
        )
      )

    if (appointment.status !== 'SCHEDULED')
      return left(
        new BadRequestError(
          'You cannot start an appointment that is not scheduled.'
        )
      )

    appointment.status = 'IN_PROGRESS'
    await this.appointmentsRepository.save(appointment)

    return right({
      appointment,
    })
  }
}
