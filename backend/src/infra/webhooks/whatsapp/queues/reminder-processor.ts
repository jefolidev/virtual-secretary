import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Job, Queue } from 'bullmq'
import { WhatsappService } from '../whatsapp.service'

@Processor('whatsapp-reminders')
export class WhatsappRemindersProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private appointmentRepository: AppointmentsRepository,
    private userRepository: UserRepository,
    private whatsappService: WhatsappService,
    @InjectQueue('whatsapp-reminders') private remindersQueue: Queue,
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { appointmentId } = job.data

    // processing reminder job

    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      console.error(`Appointment with ID ${appointmentId} not found.`)
      return
    }

    if (
      appointment.status !== 'SCHEDULED' &&
      appointment.status !== 'CONFIRMED'
    ) {
      return
    }

    const user = await this.userRepository.findByClientId(
      appointment.clientId.toString(),
    )

    if (!user) {
      console.error(`User for client ID not found.`)
      return
    }

    const professional = await this.userRepository.findByProfessionalId(
      appointment.professionalId.toString(),
    )

    if (!professional) {
      console.error(`User for professional ID not found.`)
      return
    }

    switch (job.name) {
      case 'send-24h-reminder':
        try {
          await this.whatsappService.sendMessage(
            user.whatsappNumber,
            `Olá ${user.name}! Esta é uma mensagem automática para lembrá-lo do seu compromisso agendado para *${appointment.startDateTime.toLocaleString()}*, com o(a) doutor(a) *${professional.name}*.
            
Confirme sua presença enviando *confirmar*, ou *cancelar* para cancelar.

Caso não responda em até 12 horas a partir dessa mensagem, o compromisso será considerado como não confirmado. Se precisar reagendar ou cancelar, por favor, entre em contato conosco. Obrigado!`,
          )
        } catch (err) {
          console.error(
            '[WhatsappRemindersProcessor] Error sending 24h reminder:',
            err,
          )
        }

        // marca pendência de confirmação para permitir respostas rápidas (TTL 12h por padrão)
        try {
          await this.whatsappService.markPendingConfirmation(
            user.whatsappNumber,
            appointment.id.toString(),
          )
        } catch (err) {
          console.error('Erro ao marcar pending confirmation:', err)
        }
        break

      case 'send-2h-reminder':
        // Only send 2h reminder if the user already confirmed the appointment
        if (appointment.status !== 'CONFIRMED') {
          break
        }

        try {
          await this.whatsappService.sendMessage(
            user.whatsappNumber,
            `Olá ${user.name}! Esta é uma mensagem automática para lembrá-lo do seu compromisso agendado para *${appointment.startDateTime.toLocaleString()}*, com o(a) doutor(a) *${professional.name}*.

Falta 2 horas para o seu compromisso, fique atento!`,
          )
        } catch (err) {
          console.error(
            '[WhatsappRemindersProcessor] Error sending 2h reminder:',
            err,
          )
        }
        break

      case 'send-30min-reminder':
        // Only send 30min reminder if the user already confirmed the appointment
        if (appointment.status !== 'CONFIRMED') {
          break
        }

        try {
          await this.whatsappService.sendMessage(
            user.whatsappNumber,
            `Olá ${user.name}! Esta é uma mensagem automática para lembrá-lo do seu compromisso agendado para *${appointment.startDateTime.toLocaleString()}*, com o(a) doutor(a) *${professional.name}*.
            
Falta 30 minutos para o seu compromisso.`,
          )
        } catch (err) {
          console.error(
            '[WhatsappRemindersProcessor] Error sending 30min reminder:',
            err,
          )
        }
        break

      case 'auto-cancel-timeout':
        if (appointment.status === 'SCHEDULED') {
          appointment.status = 'CANCELLED'
          await this.appointmentRepository.save(appointment)

          try {
            try {
              await this.whatsappService.sendMessage(
                user.whatsappNumber,
                `Olá ${user.name}, infelizmente seu compromisso agendado para ${appointment.startDateTime.toLocaleString()}, com o(a) doutor(a) ${professional.name} foi cancelado por falta de confirmação.
              
  Por favor, entre em contato para reagendar. Obrigado!`,
              )
            } catch (err) {
              console.error(
                '[WhatsappRemindersProcessor] Error sending auto-cancel message:',
                err,
              )
            }
            // clear pending confirmation/cache entries
            try {
              await this.whatsappService.clearPendingConfirmation(
                user.whatsappNumber,
              )
              await this.whatsappService.clearPendingCancelJob(
                user.whatsappNumber,
              )
            } catch (err) {
              console.error(
                '[WhatsappRemindersProcessor] Error clearing pending confirmation after auto-cancel:',
                err,
              )
            }
          } catch (err) {
            console.error(
              '[WhatsappRemindersProcessor] Error sending auto-cancel message:',
              err,
            )
          }
        }
        break
    }
  }
}
