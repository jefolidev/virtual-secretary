import { DomainEvents } from '@src/core/events/domain-events'
import type { EventHandler } from '@src/core/events/event-handler'
import type { ClientRepository } from '@src/domain/scheduling/application/repositories/client.repository'
import type { ProfessionalRepository } from '@src/domain/scheduling/application/repositories/professional-repository'
import { ScheduledAppointmentEvent } from '@src/domain/scheduling/enterprise/events/scheduled-appointment-event'
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
      this.sendNewAppointmentNotification.bind(this),
      ScheduledAppointmentEvent.name
    )
  }

  private async sendNewAppointmentNotification({
    appointment,
  }: ScheduledAppointmentEvent) {
    const professional = await this.professionalRepository.findById(
      appointment.professionalId
    )

    const client = await this.clientRepository.findById(appointment.clientId)

    if (professional && client) {
      await this.sendNotification.execute({
        recipientId: professional.id.toString(),
        title: `Consulta cancelada`,
        content: `O paciente ${client.name.toUpperCase()} cancelou a consulta do dia ${dayjs(appointment.startDateTime).format('DD/MM/YYYY')}.`,
      })
    }
  }
}
