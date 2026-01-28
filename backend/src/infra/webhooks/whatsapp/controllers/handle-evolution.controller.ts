import { Public } from '@/infra/auth/public'
import { Body, Controller, Post } from '@nestjs/common'
import { WhatsappService } from '../whatsapp.service'

@Controller('webhooks/whatsapp')
export class HandleEvolutionController {
  constructor(private readonly whatsappService: WhatsappService) {}

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
        const messageId = key.id

        if (!message) return { success: true }

        const whatsappId = key.remoteJid
        const sender = data.pushName || 'Usuário'

        this.whatsappService
          .processMessage(message, whatsappId, sender, messageId)
          .then(async (response) => {
            if (response) {
              await this.whatsappService.sendMessage(whatsappId, response)
              console.log(`📤 Resposta enviada para ${whatsappId}`)
            }
          })
          .catch((err) => {
            console.error('❌ Erro no processamento assíncrono:', err)
          })

        return { success: true, status: 'Processing' }
      }

      return { success: true }
    } catch (error: unknown) {
      console.error('Error handling webhook:', error)
      return { status: 'error' }
    }
  }
}
