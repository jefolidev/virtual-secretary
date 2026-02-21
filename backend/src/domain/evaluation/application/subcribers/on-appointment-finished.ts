import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { WhatsappRepository } from '@/domain/scheduling/application/repositories/whatsapp.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnAppointmentFinished implements EventHandler {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly userRepository: UserRepository,
    private readonly whatsappRepository: WhatsappRepository,
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handleAppointmentFinished.bind(this),
      'FinishedAppointmentEvent',
    )
  }
  private async handleAppointmentFinished({ appointment }: any) {
    const professional = await this.professionalRepository.findById(
      appointment.professionalId.toString(),
    )

    const userClient = await this.userRepository.findByClientId(
      appointment.clientId.toString(),
    )

    const userProfessional = await this.userRepository.findByProfessionalId(
      appointment.professionalId.toString(),
    )

    if (professional && userClient && userProfessional) {
      const message = `Olá ${userClient.name}, esperamos que sua consulta com *${userProfessional.name}* tenha sido ótima! Gostaríamos de ouvir sua opinião. Por favor, avalie sua experiência de 1 a 10, sendo 1 muito ruim e 10 excelente!`

      await this.whatsappRepository.sendMessage(
        userClient.whatsappNumber,
        message,
      )

      appointment.status = 'AWAITING_SCORE'
      try {
        await this.appointmentsRepository.save(appointment)
      } catch (err) {
        console.error(
          '[OnAppointmentFinished] Error saving appointment status AWAITING_SCORE',
          err,
        )
      }
    }

    console.log(
      `[OnAppointmentFinished] Appointment finished: ${appointment.id.toString()}`,
    )

    // Aqui você pode adicionar lógica adicional, como enviar notificações, atualizar estatísticas, etc.
  }
}
