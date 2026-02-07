import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { ScheduledAppointmentEvent } from '@/domain/scheduling/enterprise/events/scheduled-appointment-event'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { SendNotificationUseCase } from '../use-cases/send-notification'

@Injectable()
export class OnAppointmentScheduled implements EventHandler {
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
      this.sendNewAppointmentNotification.bind(this),
      ScheduledAppointmentEvent.name,
    )
  }

  private async sendNewAppointmentNotification({
    appointment,
  }: ScheduledAppointmentEvent) {
    if (!appointment.syncWithGoogleCalendar) {
      console.log(
        `[OnAppointmentCreated] Skipping Google Calendar sync for appointment ${appointment.id.toString()}`,
      )
      return
    }

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

    const client = await this.clientRepository.findById(
      appointment.clientId.toString(),
    )

    if (professional && client) {
      const result = await this.sendNotification.execute({
        recipientId: user.id?.toString(),
        title: `Nova consulta agendada`,
        content: `O paciente agendou uma consulta para ${dayjs(
          appointment.startDateTime,
        ).format('DD/MM/YYYY')} às ${dayjs(appointment.startDateTime).format(
          'hh:mm',
        )}.`,
        reminderType: 'NEW_APPOINTMENT',
      })
    } else {
      throw new NotFoundError(
        `Professional or client not found for appointmentId: ${appointment.id.toString()}`,
      )
    }
  }
}
