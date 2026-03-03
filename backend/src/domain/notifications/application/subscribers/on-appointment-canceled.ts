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
  }: CanceledAppointmentEvent) {
    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString(),
    )

    const client = await this.clientRepository.findById(
      appointment.clientId.toString(),
    )

    if (professional && client) {
      const professionalUser = await this.userRepository.findByProfessionalId(
        professional.id.toString(),
      )

      if (!professionalUser) return

      await this.sendNotification.execute({
        recipientId: professionalUser.id.toString(),
        title: `Consulta cancelada`,
        content: `O paciente cancelou a consulta do dia ${dayjs(
          appointment.startDateTime,
        ).format('DD/MM/YYYY')}.`,
        reminderType: 'CANCELLATION',
      })
    }
  }
}
