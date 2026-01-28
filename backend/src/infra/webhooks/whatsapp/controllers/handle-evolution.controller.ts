import { Public } from '@/infra/auth/public'
import { Body, Controller, Post } from '@nestjs/common'
import { WhatsappService } from '../whatsapp.service'

@Controller('webhooks/whatsapp/')
export class HandleEvolutionController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Public()
  @Post()
  async handleWebhook(@Body() body: any) {
    try {
      if (body.event === 'messages.upsert') {
        const message = body.data.message.conversation
        const pushName = body.data.pushName

        const data = body.data
        const key = data.key

        if (key.fromMe) {
          console.error('⚠️ Mensagem do bot ignorada')
          return { success: true, message: 'Message from bot ignored' }
        }

        if (!message) {
          console.error('⚠️ Mensagem sem texto')
          return { success: true, message: 'No text content' }
        }

        const whatsappId = key.remoteJid
        const sender = data.pushName || 'Usuário'

        // Chamar o service para processar
        const response = await this.whatsappService.processMessage(
          message,
          whatsappId,
          sender,
        )

        if (!response) {
          console.error('⚠️ Nenhuma resposta gerada')
          return { success: true, message: 'No response generated' }
        }

        await this.whatsappService.sendMessage(whatsappId, response)

        console.log('📤 Resposta gerada:', response)

        return { success: true, response }
      }
      return { success: true, message: 'Event ignored' }
    } catch (error: unknown) {
      console.error('Error handling webhook:', error)
      return { status: 'error', message: (error as Error).message }
    }
  }
}
