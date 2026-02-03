import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { FlowModule } from '../flow/flow.module'
import { SessionModule } from '../sessions/session.module'
import { CalendarModule } from './google-calendar/calendar.module'
import { OpenAIModule } from './openai/openai.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'

@Module({
  imports: [
    OpenAIModule,
    WhatsappModule,
    SessionModule,
    FlowModule,
    CalendarModule,
    // Define o prefixo /webhooks para todos os módulos filhos
    RouterModule.register([
      {
        path: 'webhooks',
        children: [
          { path: 'whatsapp', module: WhatsappModule },
          { path: 'openai', module: OpenAIModule },
          { path: 'google', module: CalendarModule },
        ],
      },
    ]),
  ],
  exports: [
    OpenAIModule,
    WhatsappModule,
    SessionModule,
    FlowModule,
    CalendarModule,
  ],
})
export class WebhooksModule {}
