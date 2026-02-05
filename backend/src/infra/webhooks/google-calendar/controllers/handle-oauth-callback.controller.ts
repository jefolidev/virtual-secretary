import { HandleOAuthCallbackUseCase } from '@/domain/scheduling/application/use-cases/handle-oauth-callback'
import { BadRequestException, Controller, Get, Query } from '@nestjs/common'

@Controller('oauth/callback')
export class HandleOAuthCallbackController {
  constructor(
    private readonly handleAuthCallBackUseCase: HandleOAuthCallbackUseCase,
  ) {}

  @Get()
  async handle(@Query('code') code: string, @Query('state') state: string) {
    if (!code || !state) {
      throw new BadRequestException('Missing code or state parameter')
    }

    let professionalId: string
    try {
      const stateData = JSON.parse(state)
      professionalId = stateData.professionalId
    } catch {
      throw new BadRequestException('Invalid state parameter')
    }

    const result = await this.handleAuthCallBackUseCase.execute({
      code,
      professionalId,
    })

    if (result.isLeft()) {
      throw new BadRequestException(result.value)
    }

    return {
      googleAccountEmail: result.value.googleAccountEmail,
    }
  }
}
