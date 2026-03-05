import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import type { Appointment } from '../../enterprise/entities/appointment'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { ClientRepository } from '../repositories/client.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'

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

@Injectable()
export class StartAppointmentUseCase {
  constructor(
    readonly appointmentsRepository: AppointmentsRepository,
    readonly clientRepository: ClientRepository,
    readonly professionalRepository: ProfessionalRepository,
  ) {}

  async execute({
    appointmentId,
    professionalId,
  }: StartAppointmentUseCaseRequest): Promise<StartAppointmentUseCaseResponse> {
    const appointment = await this.appointmentsRepository.findById(
      appointmentId.toString(),
    )

    if (!appointment) return left(new NotFoundError('Appointment not found!'))

    const { clientId } = appointment

    const professional =
      await this.professionalRepository.findById(professionalId)

    if (!professional) return left(new NotFoundError('Professional not found!'))

    const client = await this.clientRepository.findById(clientId.toString())

    if (!client) return left(new NotFoundError('Client not found!'))

    if (!appointment.professionalId.equals(new UniqueEntityId(professionalId)))
      return left(
        new NotAllowedError(
          'You cannot start an appointment that is not yours.',
        ),
      )

    // Validate payment status
    if (appointment.paymentStatus !== 'SUCCEEDED') {
      return left(
        new BadRequestError(
          'Cannot start appointment: payment must be completed.',
        ),
      )
    }

    // Validate confirmation status
    if (appointment.status !== 'CONFIRMED') {
      return left(
        new BadRequestError(
          'Cannot start appointment: appointment must be confirmed.',
        ),
      )
    }

    try {
      if (appointment.totalElapsedMs) {
        appointment.resume()
        await this.appointmentsRepository.save(appointment)

        return right({
          appointment,
        })
      }

      appointment.start()
      await this.appointmentsRepository.save(appointment)

      return right({
        appointment,
      })
    } catch (error: unknown) {
      return left(new BadRequestError((error as Error).message))
    }
  }
}
