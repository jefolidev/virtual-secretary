import { Controller, Get, Query } from '@nestjs/common'
import { GoogleCalendarService } from '../calendar.service'

@Controller('auth')
export class GetAuthUrlController {
  constructor(private readonly calendarService: GoogleCalendarService) {}

  @Get('url')
  handle(@Query('professionalId') professionalId: string) {
    if (!professionalId) {
      return { error: 'professionalId is required' }
    }

    return {
      url: this.calendarService.getAuthUrl(professionalId),
      message: 'Redirect user to this URL to authorize Google Calendar',
    }
  }
}
