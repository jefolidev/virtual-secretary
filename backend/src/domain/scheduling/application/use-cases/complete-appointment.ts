import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { ClientRepository } from '../repositories/client.repository'
import type { ProfessionalRepository } from '../repositories/professional.repository'

export interface CompleteAppointmentUseCaseRequest {
  appointmentId: string
  professionalId: string
}

export type CompleteAppointmentUseCaseResponse = Either<
  NotAllowedError | NotFoundError | BadRequestError,
  {
    appointment: Appointment
    totalElapsedMs: number | null
  }
>

export class CompleteAppointmentUseCase {
  constructor(
    readonly appointmentsRepository: AppointmentsRepository,
    readonly clientRepository: ClientRepository,
    readonly professionalRepository: ProfessionalRepository
  ) {}

  async execute({
    appointmentId,
    professionalId,
  }: CompleteAppointmentUseCaseRequest): Promise<CompleteAppointmentUseCaseResponse> {
    const appointment = await this.appointmentsRepository.findById(
      appointmentId.toString()
    )

    if (!appointment) return left(new NotFoundError('Appointment not found!'))

    const { clientId } = appointment

    const professional = await this.professionalRepository.findById(
      professionalId
    )

    if (!professional) return left(new NotFoundError('Professional not found!'))

    const client = await this.clientRepository.findById(clientId.toString())

    if (!client) return left(new NotFoundError('Client not found!'))

    if (!appointment.professionalId.equals(new UniqueEntityId(professionalId)))
      return left(
        new NotAllowedError(
          'You cannot complete an appointment that is not yours.'
        )
      )

    try {
      appointment.complete()
      await this.appointmentsRepository.save(appointment)

      return right({
        appointment,
        totalElapsedMs: appointment.totalElapsedMs,
      })
    } catch (error) {
      return left(new BadRequestError(error.message))
    }
  }
}
