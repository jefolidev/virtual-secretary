import { GoogleCalendarTokenRepository } from '@/domain/scheduling/application/repositories/google-calendar-token.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { Public } from '@/infra/auth/public'
import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller('/google/calendar')
export class GoogleOAuthInitController {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly googleCalendarTokenRepository: GoogleCalendarTokenRepository,
  ) {}

  @Get('/connect')
  @Public()
  async connect(
    @CurrentUser() { sub: userId }: UserPayload,
    @Res() res: Response,
  ) {
    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' })
    }

    const authUrl = await this.googleCalendarTokenRepository.getAuthUrl(
      professional.id.toString(),
    )
    return res.redirect(authUrl)
  }
}
