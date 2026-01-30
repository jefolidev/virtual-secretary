import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { Public } from '@/infra/auth/public'
import { FlowService } from '@/infra/flow/flow.service'
import { SessionService } from '@/infra/sessions/session.service'
import { Body, Controller, Post } from '@nestjs/common'
import { OpenAiService } from '../../openai/openai.service'
import { WhatsappService } from '../whatsapp.service'

@Controller('webhooks/whatsapp')
export class HandleEvolutionController {
  constructor(
    private readonly sessionsService: SessionService,
    private readonly whatsappService: WhatsappService,
    private readonly flowService: FlowService,
    private readonly openAiService: OpenAiService,
    private readonly userRepository: UserRepository,
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
        const messageId = key.id

        const whatsappId = key.remoteJid
        const whatsappNumber = data.key.remoteJid.split('@')[0]

        const user = await this.userRepository.findByPhone(whatsappNumber)

        const aiIntent = await this.openAiService.determineUserIntent(message)

        let session

        if (user) {
          console.log('achou user')

          session = await this.sessionsService.getOrCreateSession(
            user.id.toString(),
          )
        } else {
          console.log('nao achou user')
          session =
            await this.sessionsService.getOrCreateSessionByWhatsapp(
              whatsappNumber,
            )
        }

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
