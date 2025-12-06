import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import type { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import type { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { ScheduledAppointmentEvent } from '@/domain/scheduling/enterprise/events/scheduled-appointment-event'
import dayjs from 'dayjs'
import type { SendNotificationUseCase } from '../use-cases/send-notification'

export class OnAppointmentScheduled implements EventHandler {
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
      appointment.professionalId.toString()
    )

    const client = await this.clientRepository.findById(
      appointment.clientId.toString()
    )

    if (professional && client) {
      await this.sendNotification.execute({
        recipientId: professional.id.toString(),
        title: `Nova consulta agendada`,
        content: `O paciente agendou uma consulta para ${dayjs(
          appointment.startDateTime
        ).format('DD/MM/YYYY')} às ${dayjs(appointment.startDateTime).format(
          'hh:mm'
        )}.`,
      })
    }
  }
}
