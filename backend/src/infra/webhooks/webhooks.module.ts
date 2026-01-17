import { Module } from '@nestjs/common'
import { OpenAIModule } from './openai/openai.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'

@Module({
  imports: [OpenAIModule, WhatsappModule],
  exports: [OpenAIModule, WhatsappModule],
})
export class WebhooksModule {}
