import { SendEvaluationCommentUseCase } from '@/domain/evaluation/application/use-case/send-evaluation-comment'
import { SendEvaluationScoreUseCase } from '@/domain/evaluation/application/use-case/send-evaluation-score'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { WhatsappContactRepository } from '@/domain/scheduling/application/repositories/whatsapp-contact.repository'
import { WhatsappRepository } from '@/domain/scheduling/application/repositories/whatsapp.repository'
import { Public } from '@/infra/auth/public'
import { FlowService } from '@/infra/flow/flow.service'
import { SessionService } from '@/infra/sessions/session.service'
import { Body, Controller, Post } from '@nestjs/common'
import { OpenAiService } from '../../openai/openai.service'
import { WhatsappService } from '../whatsapp.service'

@Controller() // Agora só precisa do path relativo, o /webhooks/whatsapp vem do RouterModule
export class HandleEvolutionController {
  constructor(
    private readonly sessionsService: SessionService,
    private readonly flowService: FlowService,
    private readonly openAiService: OpenAiService,
    private readonly userRepository: UserRepository,

    private readonly appointmentRepository: AppointmentsRepository,

    private readonly whatsappService: WhatsappService,
    private readonly whatsappContactRepository: WhatsappContactRepository,
    private readonly whatsappRepository: WhatsappRepository,

    private readonly sendEvaluationScoreUseCase: SendEvaluationScoreUseCase,
    private readonly sendEvaluationCommentUseCase: SendEvaluationCommentUseCase,
  ) {}

  @Public()
  @Post()
  async handleWebhook(@Body() body: any) {
    try {
      if (body.event === 'messages.upsert') {
        const data = body.data
        const key = data.key

        if (key.fromMe) return { success: true }

        const message =
          data.message.conversation || data.message.extendedTextMessage?.text

        if (!message) return { success: true }

        const whatsappId = key.remoteJid
        const whatsappNumber = data.key.remoteJid.split('@')[0]

        const user = await this.userRepository.findByPhone(whatsappNumber)

        const replyIntent =
          await this.whatsappService.parseScheduleConfirmationReply(message)

        const confirmationIntent =
          replyIntent === 'confirm' ||
          replyIntent === 'cancel' ||
          replyIntent === 'reschedule'

        if (confirmationIntent) {
          const pending =
            await this.whatsappService.getPendingConfirmation(whatsappNumber)
          if (pending) {
            await this.whatsappService.handleConfirmAppointment(
              message,
              whatsappNumber,
              pending,
            )
            return { success: true }
          }
        }

        const aiIntent = await this.openAiService.determineUserIntent(message)

        let session

        if (user) {
          await this.whatsappContactRepository.linkToUser(
            whatsappNumber,
            user.id.toString(),
          )

          const pendingScheduleConfirmation =
            await this.whatsappService.getPendingConfirmation(whatsappNumber)

          console.log(
            'Pending schedule confirmation:',
            pendingScheduleConfirmation,
          )

          if (pendingScheduleConfirmation) {
            const replyIntent =
              await this.whatsappService.parseScheduleConfirmationReply(message)

            if (replyIntent === 'unknown') {
              return this.whatsappRepository.sendMessage(
                user.whatsappNumber,
                `Não entendi bem sua resposta 😅\n\nVocê ainda tem uma consulta aguardando confirmação. Por favor, responda:\n\n✅ *confirmar* — para confirmar sua consulta\n❌ *cancelar* — para cancelar\n🔄 *reagendar* — para remarcar`,
              )
            }
            return this.whatsappService.handleConfirmAppointment(
              message,
              user.whatsappNumber,
              pendingScheduleConfirmation,
            )
          }

          const pendingEvaluation =
            await this.whatsappRepository.getPendingEvaluation(
              user.whatsappNumber,
            )

          if (pendingEvaluation) {
            const appointment =
              await this.appointmentRepository.findById(pendingEvaluation)

            if (appointment) {
              if (appointment.status === 'AWAITING_SCORE') {
                const score = parseInt(message.trim())

                if (isNaN(score) || score < 1 || score > 10) {
                  await this.whatsappService.sendMessage(
                    whatsappId,
                    'Por favor, envie um número de 1 a 10 para avaliar sua experiência.',
                  )
                  return { success: true }
                }

                await this.sendEvaluationScoreUseCase.execute({
                  appointmentId: pendingEvaluation,
                  score,
                })

                if (score <= 3) {
                  await this.whatsappService.sendMessage(
                    whatsappId,
                    'Lamentamos que sua experiência não tenha sido satisfatória. Se desejar, por favor, envie um comentário detalhado sobre o que aconteceu para que possamos entender melhor e trabalhar para melhorar nossos serviços. Caso contrário digite *pular* para finalizar sua avaliação.',
                  )
                }

                if (score >= 4 && score <= 7) {
                  await this.whatsappService.sendMessage(
                    whatsappId,
                    'Agradecemos por sua avaliação! Se quiser, deixe um comentário sobre o que poderíamos melhorar para tornar sua experiência ainda melhor. Agradecemos por dedicar um tempo para nos ajudar a melhorar nossos serviços! Caso contrário digite *pular* para finalizar sua avaliação.',
                  )
                }

                if (score >= 8 && score <= 10) {
                  await this.whatsappService.sendMessage(
                    whatsappId,
                    'Ficamos felizes em saber que sua experiência foi positiva! Se quiser, deixe um comentário sobre o que você mais gostou ou se tem alguma sugestão para melhorarmos ainda mais nossos serviços. Caso contrário digite *pular* para finalizar sua avaliação. Agradecemos por dedicar um tempo para nos ajudar a melhorar nossos serviços!',
                  )
                }

                return { success: true }
              }

              if (appointment.status === 'AWAITING_COMMENT') {
                const comment = message.trim()

                if (comment.toLowerCase() === 'pular') {
                  await this.whatsappRepository.sendMessage(
                    whatsappId,
                    'Entendido, vamos finalizar sua avaliação. Agradecemos por dedicar um tempo para nos ajudar a melhorar nossos serviços! Se tiver mais alguma coisa que queira compartilhar conosco no futuro, não hesite em entrar em contato. Tenha um ótimo dia!',
                  )

                  appointment.status = 'COMPLETED'
                  await this.appointmentRepository.save(appointment)

                  return { success: true }
                } else {
                  await this.sendEvaluationCommentUseCase.execute({
                    appointmentId: pendingEvaluation,
                    comment,
                  })
                }

                await this.whatsappService.sendMessage(
                  whatsappId,
                  'Obrigado por compartilhar seu comentário! Agradecemos por dedicar um tempo para nos ajudar a melhorar nossos serviços! Se tiver mais alguma coisa que queira compartilhar conosco no futuro, não hesite em entrar em contato. Tenha um ótimo dia!',
                )

                return { success: true }
              }
            }
          }
          session = await this.sessionsService.getOrCreateSession(
            user.id.toString(),
          )
        } else {
          await this.whatsappContactRepository.upsertFromWebhook(body)

          session =
            await this.sessionsService.getOrCreateSessionByWhatsapp(
              whatsappNumber,
            )
        }

        await this.whatsappContactRepository.upsertFromWebhook(body)

        const response = await this.flowService.execute(
          aiIntent,
          session,
          message,
          user,
        )
        if (response) {
          await this.whatsappService.sendMessage(whatsappId, response)
          console.log(`📤 Resposta enviada para ${whatsappId}`)
        }

        return { success: true, status: 'Processing' }
      }

      return { success: true }
    } catch (error: unknown) {
      console.error('Error handling webhook:', error)
      return { status: 'error' }
    }
  }
}
