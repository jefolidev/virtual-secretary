import { HandlePaymentWebhookUseCase } from '@/domain/payments/application/use-case/handle-payment-webhook'
import { MercadoPagoTokenRepository } from '@/domain/payments/application/repositories/mercado-pago-token.repository'
import { NotificationsRepository } from '@/domain/notifications/application/repositories/notification.repository'
import { Notification } from '@/domain/notifications/enterprise/entities/notification'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { Public } from '@/infra/auth/public'
import { SessionService } from '@/infra/sessions/session.service'
import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common'
import { WhatsappService } from '../whatsapp/whatsapp.service'

interface MercadoPagoWebhookBody {
  type: string
  user_id?: string
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
    private readonly mercadoPagoTokenRepository: MercadoPagoTokenRepository,
    private readonly notificationsRepository: NotificationsRepository,
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

      const professionalToken = body.user_id
        ? await this.mercadoPagoTokenRepository.findByMpUserId(String(body.user_id))
        : null

      const result = await this.handlePaymentWebhookUseCase.execute({
        providerPaymentId,
        professionalAccessToken: professionalToken?.accessToken ?? undefined,
      })

      if (result.isLeft()) {
        this.logger.warn(
          `Webhook processing failed for payment ${providerPaymentId}: ${result.value.message}`,
        )
        return { received: true }
      }

      const { clientId, isPaid, appointmentId, professionalId, status } = result.value

      if (status === 'PENDING') {
        return { received: true }
      }

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

        const professionalUser = await this.userRepository.findByProfessionalId(professionalId)
        if (professionalUser) {
          const notification = Notification.create({
            recipientId: new UniqueEntityId(professionalUser.id.toString()),
            title: 'Pagamento recebido',
            content: `O pagamento do agendamento foi confirmado com sucesso.`,
            reminderType: 'PAYMENT_STATUS',
          })
          await this.notificationsRepository.create(notification)
        }
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
