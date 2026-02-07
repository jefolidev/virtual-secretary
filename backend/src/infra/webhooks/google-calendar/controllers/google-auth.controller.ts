import { AuthenticateWithGoogleUseCase } from '@/domain/scheduling/application/use-cases/authenticate-user-with-google'
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'
import { GoogleUser } from '../../../auth/google-auth.strategy'
import { Public } from '../../../auth/public'
import { Env } from '../../../env/env'

interface RequestWithUser extends Request {
  user: GoogleUser
}

@Controller('auth')
export class GoogleAuthController {
  constructor(
    private readonly configService: ConfigService<Env, true>,
    private readonly authenticateWithGoogleUseCase: AuthenticateWithGoogleUseCase,
  ) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redireciona automaticamente para o Google
  }

  @Public()
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    console.log('=== Google Auth Callback ===')
    const googleUser = req.user
    console.log('Google User:', {
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
    })

    const frontendUrl = this.configService.get('FRONTEND_URL')
    console.log('Frontend URL:', frontendUrl)

    const result = await this.authenticateWithGoogleUseCase.execute({
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      picture: googleUser.picture,
    })

    if (result.isLeft()) {
      console.log('Auth failed:', result.value.message)
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(result.value.message)}`,
      )
    }

    console.log('Auth successful!')

    const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24

    const { accessToken, user } = result.value

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ONE_DAY_IN_MS, // 7 days
    })

    res.cookie('user_data', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ONE_DAY_IN_MS, // 7 days
    })

    const redirectUrl =
      `${frontendUrl}/auth/google/success?` +
      `token=${encodeURIComponent(accessToken)}` +
      `&email=${encodeURIComponent(user.email)}` +
      `&name=${encodeURIComponent(user.name)}` +
      `&picture=${encodeURIComponent(user.picture)}`

    console.log('Redirecting to:', redirectUrl)

    return res.redirect(redirectUrl)
  }
}
