import { HandlePaymentWebhookUseCase } from '@/domain/payments/application/use-case/handle-payment-webhook'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { Public } from '@/infra/auth/public'
import { SessionService } from '@/infra/sessions/session.service'
import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common'
import { WhatsappService } from '../whatsapp/whatsapp.service'

interface MercadoPagoWebhookBody {
  type: string
  data: {
    id: string
  }
}

@Controller('webhooks/mercado-pago')
export class MercadoPagoWebhookController {
  private readonly logger = new Logger(MercadoPagoWebhookController.name)

  constructor(
    private readonly handlePaymentWebhookUseCase: HandlePaymentWebhookUseCase,
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Public()
  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: MercadoPagoWebhookBody) {
    try {
      if (body?.type !== 'payment' || !body?.data?.id) {
        return { received: true }
      }

      const providerPaymentId = String(body.data.id)

      const result = await this.handlePaymentWebhookUseCase.execute({
        providerPaymentId,
      })

      if (result.isLeft()) {
        this.logger.warn(
          `Webhook processing failed for payment ${providerPaymentId}: ${result.value.message}`,
        )
        return { received: true }
      }

      const { clientId, isPaid, appointmentId } = result.value

      const user = await this.userRepository.findByClientId(clientId)

      if (!user?.whatsappNumber) {
        this.logger.warn(
          `No whatsapp number found for client ${clientId} after payment webhook`,
        )
        return { received: true }
      }

      await this.sessionService.finishSessionsByUserId(user.id.toString())

      if (isPaid) {
        await this.whatsappService.sendMessage(
          user.whatsappNumber,
          `✅ *Pagamento confirmado!*\n\nSeu pagamento foi recebido com sucesso. Seu agendamento está confirmado!\n\nSe precisar de qualquer informação, estou à disposição.`,
        )
      } else {
        await this.whatsappService.sendMessage(
          user.whatsappNumber,
          `❌ *Pagamento não confirmado.*\n\nInfelizmente não foi possível confirmar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.`,
        )
      }

      return { received: true }
    } catch (error) {
      this.logger.error('Error processing Mercado Pago webhook', error)
      return { received: true }
    }
  }
}
