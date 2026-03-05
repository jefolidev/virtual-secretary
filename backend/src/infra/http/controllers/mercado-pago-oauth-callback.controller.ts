import { MercadoPagoTokenRepository } from '@/domain/payments/application/repositories/mercado-pago-token.repository'
import { MercadoPagoToken } from '@/domain/payments/enterprise/entities/mercado-pago-token'
import { Public } from '@/infra/auth/public'
import { Env } from '@/infra/env/env'
import { MercadoPagoService } from '@/infra/webhooks/mercado-pago/mercado-pago.service'
import { Controller, Get, Query, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

@Controller('/mercado-pago/oauth')
export class MercadoPagoOAuthCallbackController {
  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly mercadoPagoTokenRepository: MercadoPagoTokenRepository,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @Get('/callback')
  @Public()
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendUrl =
      this.configService.get('FRONTEND_URL', { infer: true }) ||
      'http://localhost:5173'

    if (error) {
      return res.redirect(
        `${frontendUrl}/settings/connections?mp_connected=false&error=${encodeURIComponent(error)}`,
      )
    }

    if (!code || !state) {
      return res.redirect(
        `${frontendUrl}/settings/connections?mp_connected=false&error=missing_params`,
      )
    }

    let professionalId: string

    try {
      professionalId = Buffer.from(state, 'base64').toString('utf-8')
    } catch {
      return res.redirect(
        `${frontendUrl}/settings/connections?mp_connected=false&error=invalid_state`,
      )
    }

    try {
      const tokens = await this.mercadoPagoService.exchangeCodeForToken(code)

      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

      const token = MercadoPagoToken.create({
        professionalId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        publicKey: tokens.public_key ?? null,
        mpUserId: String(tokens.user_id),
        expiresAt,
      })

      console.log(token)

      await this.mercadoPagoTokenRepository.save(token)
    } catch (err) {
      console.error('[MercadoPagoOAuthCallback] Error connecting account:', err)
      return res.redirect(
        `${frontendUrl}/settings/connections?mp_connected=false&error=token_exchange_failed`,
      )
    }

    return res.redirect(`${frontendUrl}/settings/connections?mp_connected=true`)
  }
}
