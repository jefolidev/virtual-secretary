import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import type { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import type { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { CanceledAppointmentEvent } from '@/domain/scheduling/enterprise/events/canceled-appointment'
import dayjs from 'dayjs'
import type { SendNotificationUseCase } from '../use-cases/send-notification'

export class OnAppointmentCanceled implements EventHandler {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private clientRepository: ClientRepository,
    private sendNotification: SendNotificationUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendCanceledAppointmentNotification.bind(this),
      CanceledAppointmentEvent.name
    )
  }

  private async sendCanceledAppointmentNotification({
    appointment,
  }: CanceledAppointmentEvent) {
    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString().toString()
    )

    const client = await this.clientRepository.findById(
      appointment.clientId.toString()
    )

    if (professional && client) {
      await this.sendNotification.execute({
        recipientId: professional.id.toString(),
        title: `Consulta cancelada`,
        content: `O paciente ${client.name.toUpperCase()} cancelou a consulta do dia ${dayjs(
          appointment.startDateTime
        ).format('DD/MM/YYYY')}.`,
      })
    }
  }
}
