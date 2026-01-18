import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { CanceledAppointmentEvent } from '@/domain/scheduling/enterprise/events/canceled-appointment'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { SendNotificationUseCase } from '../use-cases/send-notification'

@Injectable()
export class OnAppointmentCanceled implements EventHandler {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private clientRepository: ClientRepository,
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
  }: CanceledAppointmentEvent) {
    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString().toString(),
    )

    const client = await this.clientRepository.findById(
      appointment.clientId.toString(),
    )

    if (professional && client) {
      await this.sendNotification.execute({
        recipientId: professional.id.toString(),
        title: `Consulta cancelada`,
        content: `O paciente cancelou a consulta do dia ${dayjs(
          appointment.startDateTime,
        ).format('DD/MM/YYYY')}.`,
        reminderType: 'CANCELLATION',
      })
    }
  }
}
