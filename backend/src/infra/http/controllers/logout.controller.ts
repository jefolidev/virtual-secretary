import { LogoutUseCase } from '@/domain/scheduling/application/use-cases/logout'
import { Cookies } from '@/infra/auth/cookies'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { Controller, Post, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller('/logout')
export class LogoutController {
  constructor(private readonly logoutUseCase: LogoutUseCase) {}

  @Post()
  async handle(
    @CurrentUser() { sub: userId }: UserPayload,
    @Cookies('access_token') token: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.logoutUseCase.execute({
      userId,
      token,
    })

    if (result.isLeft()) {
      return { success: false, message: 'Erro no logout' }
    }

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return { success: true, message: 'Logout realizado com sucesso' }
  }
}
