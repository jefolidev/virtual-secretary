import {
  type CreatePaymentPreferenceInput,
  type CreatePaymentPreferenceOutput,
  type PaymentDetails,
  PaymentGateway,
} from '@/domain/payments/application/gateway/payment-gateway'
import { Env } from '@/infra/env/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MercadoPagoService } from './mercado-pago.service'

@Injectable()
export class MercadoPagoPaymentGateway implements PaymentGateway {
  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  private get webhookUrl(): string | undefined {
    const url = this.configService.get('MERCADO_PAGO_WEBHOOK_URL', {
      infer: true,
    })
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:' ? url : undefined
    } catch {
      return undefined
    }
  }

  private get isProduction(): boolean {
    return this.configService.get('NODE_ENV', { infer: true }) === 'production'
  }

  async createPreference(
    input: CreatePaymentPreferenceInput,
  ): Promise<CreatePaymentPreferenceOutput> {
    const notificationUrl = this.webhookUrl

    const excludedTypes =
      input.paymentMethodId === 'pix'
        ? [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'prepaid_card' },
            { id: 'ticket' },
            { id: 'atm' },
            { id: 'digital_wallet' },
          ]
        : input.paymentMethodId === 'credit_card' ||
            input.paymentMethodId === 'debit_card'
          ? [{ id: 'bank_transfer' }, { id: 'ticket' }]
          : []

    const response = await this.mercadoPagoService.createPreference(
      {
        body: {
          items: [
            {
              id: input.externalReference,
              title: input.title,
              quantity: 1,
              unit_price: input.amount,
              currency_id: 'BRL',
            },
          ],
          payer: {
            email: input.payerEmail,
          },
          payment_methods: {
            excluded_payment_types: excludedTypes,
          },
          external_reference: input.externalReference,
          ...(notificationUrl ? { notification_url: notificationUrl } : {}),
          ...(this.isProduction
            ? {
                back_urls: {
                  success: `${this.configService.get('FRONTEND_URL')}/payment/success`,
                  failure: `${this.configService.get('FRONTEND_URL')}/payment/failure`,
                },
                auto_return: 'approved' as const,
              }
            : {}),
        },
      },
      input.professionalAccessToken,
    )

    return {
      preferenceId: response.id!,
      checkoutUrl: response.init_point!,
    }
  }

  async getPaymentDetails(paymentId: string, accessToken?: string): Promise<PaymentDetails> {
    const response = await this.mercadoPagoService.getPayment(paymentId, accessToken)

    return {
      paymentId: String(response.id!),
      status: response.status ?? 'unknown',
      statusDetail: response.status_detail ?? '',
      externalReference: response.external_reference ?? '',
      amount: response.transaction_amount ?? 0,
      paidAt: response.date_approved ? new Date(response.date_approved) : null,
    }
  }
}
