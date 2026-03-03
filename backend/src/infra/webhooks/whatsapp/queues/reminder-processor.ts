import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Job, Queue } from 'bullmq'
import Redis from 'ioredis'
import { WhatsappService } from '../whatsapp.service'

@Processor('whatsapp-reminders')
export class WhatsappRemindersProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private appointmentRepository: AppointmentsRepository,
    private userRepository: UserRepository,
    private whatsappService: WhatsappService,

    @InjectRedis() private readonly redis: Redis,

    @InjectQueue('whatsapp-reminders') private remindersQueue: Queue,
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { appointmentId } = job.data

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
      case 'send-24h-reminder': {
        const now = Date.now()
        const appointmentTime = appointment.startDateTime.getTime()

        const cancellationPolicy =
          await this.prisma.cancellationPolicy.findFirst({
            where: {
              professionalId: appointment.professionalId.toString(),
            },
          })

        const minNoticeHours =
          cancellationPolicy?.minHoursBeforeCancellation ?? 3
        const minNoticeMs = minNoticeHours * 60 * 60 * 1000

        const confirmationDeadline = new Date(appointmentTime - minNoticeMs)
        const timeUntilDeadline = confirmationDeadline.getTime() - now

        const appointmentDateStr =
          appointment.startDateTime.toLocaleString('pt-BR')

        // If there's still time before the confirmation deadline, schedule
        // the auto-cancel job. Always send the confirmation message regardless.
        if (timeUntilDeadline > 0) {
          await this.remindersQueue.add(
            'auto-cancel-timeout',
            { appointmentId: appointment.id.toString() },
            { delay: timeUntilDeadline },
          )

          this.redis.set(
            `whatsapp-pending-confirmation-${user.whatsappNumber}`,
            appointment.id.toString(),
            'EX',
            7 * 24 * 60 * 60,
          )
        }

        const deadlineStr = confirmationDeadline.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const isToday =
          confirmationDeadline.toDateString() === new Date().toDateString()
        const deadlineLabel =
          timeUntilDeadline > 0
            ? isToday
              ? `hoje às *${deadlineStr}*`
              : `*${confirmationDeadline.toLocaleDateString('pt-BR')} às ${deadlineStr}*`
            : null

        const deadlineClause = deadlineLabel
          ? `\n\nCaso não responda até ${deadlineLabel}, o compromisso será considerado como não confirmado.`
          : ''

        try {
          await this.whatsappService.sendMessage(
            user.whatsappNumber,
            `Olá ${user.name}! Esta é uma mensagem automática para lembrá-lo do seu compromisso agendado para *${appointmentDateStr}*, com o(a) doutor(a) *${professional.name}*.

Confirme sua presença enviando *confirmar*, ou *cancelar* para cancelar.${deadlineClause}

Se precisar reagendar ou cancelar, por favor, entre em contato conosco. Obrigado!`,
          )
        } catch (err) {
          console.error(
            '[WhatsappRemindersProcessor] Error sending 24h reminder message:',
            err,
          )
        }

        await this.appointmentRepository.markReminderAsSended(
          appointment.id.toString(),
          'D1_REMINDER',
        )

        try {
          await this.whatsappService.markPendingConfirmation(
            user.whatsappNumber,
            appointment.id.toString(),
          )
        } catch (err) {
          console.error('Erro ao marcar pending confirmation:', err)
        }
        break
      }

      case 'send-2h-reminder':
        if (appointment.status !== 'CONFIRMED') {
          break
        }

        try {
          await this.whatsappService.sendMessage(
            user.whatsappNumber,
            `Olá ${user.name}! Esta é uma mensagem automática para lembrá-lo do seu compromisso agendado para *${appointment.startDateTime.toLocaleString()}*, com o(a) doutor(a) *${professional.name}*.

Falta 2 horas para o seu compromisso, fique atento!`,
          )

          await this.appointmentRepository.markReminderAsSended(
            appointment.id.toString(),
            'T2H_REMINDER',
          )
        } catch (err) {
          console.error(
            '[WhatsappRemindersProcessor] Error sending 2h reminder:',
            err,
          )
        }
        break

      case 'send-30min-reminder':
        if (appointment.status !== 'CONFIRMED') {
          break
        }

        try {
          await this.whatsappService.sendMessage(
            user.whatsappNumber,
            `Olá ${user.name}! Esta é uma mensagem automática para lembrá-lo do seu compromisso agendado para *${appointment.startDateTime.toLocaleString()}*, com o(a) doutor(a) *${professional.name}*.
            
Falta 30 minutos para o seu compromisso.`,
          )
          await this.appointmentRepository.markReminderAsSended(
            appointment.id.toString(),
            'T30M_REMINDER',
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
