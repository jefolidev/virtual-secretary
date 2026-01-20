import { Body, Controller, Post } from '@nestjs/common'
import { WhatsappService } from '../whatsapp.service'

@Controller('webhooks/whatsapp/')
export class HandleEvolutionController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post()
  async handleWebhook(@Body() body: any) {
    if (body.event === 'messages.upsert') {
      const message = body.data.message.conversation
      const sender = body.data.key.remoteJid

      console.log('Received message from', sender, ':', message)

      console.log('Body received: ', body)
    }

    return { status: 'ok' }
  }
}
