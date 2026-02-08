import { LogoutUseCase } from '@/domain/scheduling/application/use-cases/logout'
import { Cookies } from '@/infra/auth/cookies'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { Controller, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

@Controller('/logout')
export class LogoutController {
  constructor(private readonly logoutUseCase: LogoutUseCase) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Cookies('access_token') cookieToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      cookieToken || req.headers.authorization?.replace('Bearer ', '') || ''

    await this.logoutUseCase.execute({
      userId: user?.sub || '',
      token,
      cookieOptions: { response: res, request: req },
    })

    return { success: true, message: 'Logout realizado com sucesso' }
  }
}
