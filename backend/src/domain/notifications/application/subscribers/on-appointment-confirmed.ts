import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { ConfirmedAppointmentEvent } from '@/domain/scheduling/enterprise/events/confirmed-appointment'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { SendNotificationUseCase } from '../use-cases/send-notification'

@Injectable()
export class OnAppointmentConfirmed implements EventHandler {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private clientRepository: ClientRepository,
    private userRepository: UserRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendConfirmedAppointmentNotification.bind(this),
      ConfirmedAppointmentEvent.name,
    )
  }

  private async sendConfirmedAppointmentNotification({
    appointment,
  }: ConfirmedAppointmentEvent) {
    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString(),
    )

    const user = await this.userRepository.findByProfessionalId(
      appointment.professionalId.toString(),
    )

    if (!user) {
      console.error(
        `[OnAppointmentConfirmed] User not found for professionalId: ${appointment.professionalId.toString()}`,
      )
      return
    }

    const userClient = await this.userRepository.findByClientId(
      appointment.clientId.toString(),
    )

    const client = await this.clientRepository.findById(
      appointment.clientId.toString(),
    )

    if (professional && client) {
      await this.sendNotification.execute({
        recipientId: user.id.toString(),
        title: `Consulta confirmada`,
        content: `${userClient?.name ?? 'O paciente'} confirmou a consulta do dia ${dayjs(
          appointment.startDateTime,
        ).format('DD/MM/YYYY')} às ${dayjs(appointment.startDateTime).format(
          'HH:mm',
        )}.`,
        reminderType: 'CONFIRMATION',
      })
    }
  }
}
