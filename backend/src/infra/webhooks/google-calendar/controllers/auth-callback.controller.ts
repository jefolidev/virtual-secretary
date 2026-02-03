import { Public } from '@/infra/auth/public'
import { Controller, Get, Query } from '@nestjs/common'
import { GoogleCalendarService } from '../calendar.service'

@Controller('auth/callback')
export class AuthCallbackController {
  constructor(private readonly calendarService: GoogleCalendarService) {}

  @Public()
  @Get()
  async handle(
    @Query('code') code: string,
    @Query('state') professionalId: string,
  ) {
    if (!code || !professionalId) {
      return { error: 'Missing code or professionalId (state)' }
    }

    try {
      const googleEmail = await this.calendarService.saveTokensFromCode(
        code,
        professionalId,
      )

      return {
        success: true,
        message: 'Google Calendar connected successfully',
        googleAccount: googleEmail,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
