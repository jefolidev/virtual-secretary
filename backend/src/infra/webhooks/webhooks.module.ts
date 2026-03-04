import { HandlePaymentWebhookUseCase } from '@/domain/payments/application/use-case/handle-payment-webhook'
import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { DatabaseModule } from '../database/database.module'
import { FlowModule } from '../flow/flow.module'
import { SessionModule } from '../sessions/session.module'
import { CalendarModule } from './google-calendar/calendar.module'
import { MercadoPagoWebhookController } from './mercado-pago/mercado-pago.controller'
import { MercadoPagoModule } from './mercado-pago/mercado-pago.module'
import { OpenAIModule } from './openai/openai.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'

@Module({
  imports: [
    OpenAIModule,
    WhatsappModule,
    SessionModule,
    FlowModule,
    CalendarModule,
    DatabaseModule,
    MercadoPagoModule,
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
  controllers: [MercadoPagoWebhookController],
  providers: [HandlePaymentWebhookUseCase],
  exports: [
    OpenAIModule,
    WhatsappModule,
    SessionModule,
    FlowModule,
    CalendarModule,
  ],
})
export class WebhooksModule {}
