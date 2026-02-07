import { HandleOAuthCallbackUseCase } from '@/domain/scheduling/application/use-cases/handle-oauth-callback'
import { Public } from '@/infra/auth/public'
import { Env } from '@/infra/env/env'
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

@Controller('oauth/callback')
export class HandleOAuthCallbackController {
  private processedCodes = new Set<string>()

  constructor(
    private readonly handleAuthCallBackUseCase: HandleOAuthCallbackUseCase,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @Public()
  @Get()
  async handle(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code || !state) {
      throw new BadRequestException('Missing code or state parameter')
    }

    // Previne processar o mesmo código duas vezes
    if (this.processedCodes.has(code)) {
      const frontendUrl = this.configService.get('FRONTEND_URL')
      return res.redirect(`${frontendUrl}/oauth-callback?duplicate=true`)
    }

    // Marca código como processado
    this.processedCodes.add(code)

    // Remove código do cache após 5 minutos
    setTimeout(() => this.processedCodes.delete(code), 5 * 60 * 1000)

    let professionalId: string
    try {
      const stateData = JSON.parse(state)
      professionalId = stateData.professionalId
    } catch (error) {
      throw new BadRequestException('Invalid state parameter')
    }

    const result = await this.handleAuthCallBackUseCase.execute({
      code,
      professionalId,
    })

    const frontendUrl = this.configService.get('FRONTEND_URL')

    if (result.isLeft()) {
      // Redireciona para o frontend com erro
      return res.redirect(
        `${frontendUrl}/oauth-callback?error=${encodeURIComponent(result.value || 'Unknown error')}`,
      )
    }

    // Redireciona para o frontend com sucesso
    return res.redirect(
      `${frontendUrl}/oauth-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&email=${encodeURIComponent(result.value.googleAccountEmail)}`,
    )
  }
}
