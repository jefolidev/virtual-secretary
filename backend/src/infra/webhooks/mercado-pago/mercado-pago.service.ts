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

export interface MercadoPagoOAuthTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  user_id: number
  refresh_token: string
  public_key: string
  live_mode: boolean
}

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
        // testToken: configService.get('NODE_ENV', { infer: true }) !== 'production',
      },
    })
  }

  buildOAuthUrl(professionalId: string): string {
    const clientId = this.configService.get('MERCADO_PAGO_OAUTH_CLIENT_ID', {
      infer: true,
    })

    const redirectUri = this.configService.get(
      'MERCADO_PAGO_OAUTH_REDIRECT_URI',
      { infer: true },
    )

    if (!clientId || !redirectUri) {
      throw new Error('MERCADO_PAGO_NOT_CONFIGURED')
    }

    const safeState = Buffer.from(professionalId).toString('base64')

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      platform_id: 'mp',
      state: safeState,
      redirect_uri: redirectUri,
    })

    return `https://auth.mercadopago.com.br/authorization?${params.toString()}`
  }

  async exchangeCodeForToken(
    code: string,
  ): Promise<MercadoPagoOAuthTokenResponse> {
    const clientId = this.configService.get('MERCADO_PAGO_OAUTH_CLIENT_ID', {
      infer: true,
    })
    const clientSecret = this.configService.get(
      'MERCADO_PAGO_OAUTH_CLIENT_SECRET',
      { infer: true },
    )
    const redirectUri = this.configService.get(
      'MERCADO_PAGO_OAUTH_REDIRECT_URI',
      { infer: true },
    )

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    })

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`MP OAuth token exchange failed: ${error}`)
    }

    return response.json() as Promise<MercadoPagoOAuthTokenResponse>
  }

  async refreshOAuthToken(
    refreshToken: string,
  ): Promise<MercadoPagoOAuthTokenResponse> {
    const clientId = this.configService.get('MERCADO_PAGO_OAUTH_CLIENT_ID', {
      infer: true,
    })
    const clientSecret = this.configService.get(
      'MERCADO_PAGO_OAUTH_CLIENT_SECRET',
      { infer: true },
    )

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`MP OAuth token refresh failed: ${error}`)
    }

    return response.json() as Promise<MercadoPagoOAuthTokenResponse>
  }

  async createPreference(
    data: PreferenceCreateData,
    professionalAccessToken?: string,
  ) {
    try {
      const client = professionalAccessToken
        ? new MercadoPagoClient({
            accessToken: professionalAccessToken,
            options: { timeout: 5000 },
          })
        : this.platformClient

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

  async getPayment(paymentId: string, accessToken?: string) {
    try {
      const client = accessToken
        ? new MercadoPagoClient({ accessToken, options: { timeout: 5000 } })
        : this.platformClient
      const payment = new Payment(client)
      return await payment.get({ id: paymentId })
    } catch (error) {
      console.error('Error fetching Mercado Pago payment:', error)
      throw error
    }
  }
}
