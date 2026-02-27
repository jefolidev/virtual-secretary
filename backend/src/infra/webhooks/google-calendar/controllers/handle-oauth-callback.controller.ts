import { HandleOAuthCallbackUseCase } from '@/domain/scheduling/application/use-cases/handle-oauth-callback'
import { Public } from '@/infra/auth/public'
import { Env } from '@/infra/env/env'
import { Controller, Get, Query, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

@Controller('/webhooks/google/oauth')
export class GoogleOAuthCallbackController {
  constructor(
    private readonly handleOAuthCallbackUseCase: HandleOAuthCallbackUseCase,
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
        `${frontendUrl}/auth/google/success?error=${encodeURIComponent(error)}`,
      )
    }

    if (!code || !state) {
      return res.redirect(
        `${frontendUrl}/auth/google/success?error=missing_params`,
      )
    }

    let professionalId: string

    try {
      const parsed = JSON.parse(state)
      professionalId = parsed.professionalId
    } catch {
      return res.redirect(
        `${frontendUrl}/auth/google/success?error=invalid_state`,
      )
    }

    const result = await this.handleOAuthCallbackUseCase.execute({
      code,
      professionalId,
    })

    if (result.isLeft()) {
      return res.redirect(
        `${frontendUrl}/auth/google/success?error=${encodeURIComponent(result.value)}`,
      )
    }

    return res.redirect(`${frontendUrl}/auth/google/success?connected=true`)
  }
}
