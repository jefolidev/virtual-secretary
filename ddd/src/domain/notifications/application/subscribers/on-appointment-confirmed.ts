import { DomainEvents } from '@src/core/events/domain-events'
import type { EventHandler } from '@src/core/events/event-handler'
import type { ClientRepository } from '@src/domain/scheduling/application/repositories/client.repository'
import type { ProfessionalRepository } from '@src/domain/scheduling/application/repositories/professional-repository'
import { ConfirmedAppointmentEvent } from '@src/domain/scheduling/enterprise/events/confirmed-appointment'
import type { ScheduledAppointmentEvent } from '@src/domain/scheduling/enterprise/events/scheduled-appointment-event'
import dayjs from 'dayjs'
import type { SendNotificationUseCase } from '../use-cases/send-notification'

export class OnAppointmentConfirmed implements EventHandler {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private clientRepository: ClientRepository,
    private sendNotification: SendNotificationUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendConfirmedAppointmentNotification.bind(this),
      ConfirmedAppointmentEvent.name
    )
  }

  private async sendConfirmedAppointmentNotification({
    appointment,
  }: ScheduledAppointmentEvent) {
    const professional = await this.professionalRepository.findById(
      appointment.professionalId
    )

    const client = await this.clientRepository.findById(appointment.clientId)

    if (professional && client) {
      await this.sendNotification.execute({
        recipientId: professional.id.toString(),
        title: `Consulta confirmada`,
        content: `O paciente ${client.name.toUpperCase()} confirmou a consulta do dia ${dayjs(appointment.startDateTime).format('DD/MM/YYYY')}.`,
      })
    }
  }
}
