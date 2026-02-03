import { Controller, Get } from '@nestjs/common'
import { GoogleCalendarService } from '../calendar.service'

@Controller('events')
export class GetEventsController {
  constructor(private readonly calendarService: GoogleCalendarService) {}

  @Get()
  async handle() {
    const events = await this.calendarService.listEvents()
    return { events }
  }
}
