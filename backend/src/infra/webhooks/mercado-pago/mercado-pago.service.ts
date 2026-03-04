import { Env } from '@/infra/env/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  MercadoPagoConfig as MercadoPagoClient,
  Payment,
  Preference,
} from 'mercadopago'
import type { PaymentCreateData } from 'mercadopago/dist/clients/payment/create/types'
import { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types'

@Injectable()
export class MercadoPagoService {
  private readonly platformClient: MercadoPagoClient

  constructor(private readonly configService: ConfigService<Env, true>) {
    this.platformClient = new MercadoPagoClient({
      accessToken: configService.get('MERCADO_PAGO_ACCESS_TOKEN', {
        infer: true,
      }),
      options: {
        timeout: 5000,
        testToken: true,
      },
    })
  }

  async createPreference(
    data: PreferenceCreateData,
    professionalAccessToken?: string,
  ) {
    try {
      const client = this.platformClient

      const preference = new Preference(client)
      return await preference.create(data)
    } catch (error) {
      console.error('Error creating Mercado Pago preference:', error)
      throw error
    }
  }

  async createPayment(data: PaymentCreateData) {
    try {
      const payment = new Payment(this.platformClient)
      return await payment.create(data)
    } catch (error) {
      console.error('Error creating Mercado Pago payment:', error)
      throw error
    }
  }

  async getPayment(paymentId: string) {
    try {
      const payment = new Payment(this.platformClient)
      return await payment.get({ id: paymentId })
    } catch (error) {
      console.error('Error fetching Mercado Pago payment:', error)
      throw error
    }
  }
}
