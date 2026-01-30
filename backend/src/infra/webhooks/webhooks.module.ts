import { Module } from '@nestjs/common'
import { FlowModule } from '../flow/flow.module'
import { SessionModule } from '../sessions/session.module'
import { OpenAIModule } from './openai/openai.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'

@Module({
  imports: [OpenAIModule, WhatsappModule, SessionModule, FlowModule],
  exports: [OpenAIModule, WhatsappModule],
})
export class WebhooksModule {}
