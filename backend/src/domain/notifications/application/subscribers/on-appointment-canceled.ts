import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { CanceledAppointmentEvent } from '@/domain/scheduling/enterprise/events/canceled-appointment'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { SendNotificationUseCase } from '../use-cases/send-notification'

@Injectable()
export class OnAppointmentCanceled implements EventHandler {
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
      this.sendCanceledAppointmentNotification.bind(this),
      CanceledAppointmentEvent.name,
    )
  }

  private async sendCanceledAppointmentNotification({
    appointment,
    source,
  }: CanceledAppointmentEvent) {
    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString(),
    )

    const user = await this.userRepository.findByProfessionalId(
      appointment.professionalId.toString(),
    )

    if (!user) {
      throw new NotFoundError(
        `User not found for professionalId: ${appointment.professionalId.toString()}`,
      )
    }

    const userClient = await this.userRepository.findByClientId(
      appointment.clientId.toString(),
    )

    if (!userClient) {
      throw new NotFoundError(
        `User not found for clientId: ${appointment.clientId.toString()}`,
      )
    }

    const client = await this.clientRepository.findById(
      appointment.clientId.toString(),
    )
    if (professional && client) {
      // Send different notification based on source
      if (source === 'google-calendar') {
        await this.sendNotification.execute({
          recipientId: user.id?.toString(),
          title: 'Consulta cancelada via Google Calendar',
          content:
            'Uma consulta foi cancelada diretamente no Google Calendar e foi atualizada no sistema.',
          reminderType: 'CALENDAR_SYNC_CANCELLED',
        })
      } else {
        await this.sendNotification.execute({
          recipientId: user.id?.toString(),
          title: `Consulta cancelada`,
          content: `O paciente ${userClient.name} cancelou a consulta do dia ${dayjs(
            appointment.startDateTime,
          ).format('DD/MM/YYYY')} às ${dayjs(appointment.startDateTime).format(
            'HH:mm',
          )}.`,
          reminderType: 'CANCELLATION',
        })
      }
    } else {
      throw new NotFoundError(
        `Professional or client not found for appointmentId: ${appointment.id.toString()}`,
      )
    }
  }
}
