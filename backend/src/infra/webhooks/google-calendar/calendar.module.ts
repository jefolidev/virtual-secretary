import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { GoogleCalendarService } from './calendar.service'
import { AuthCallbackController } from './controllers/auth-callback.controller'
import { GetAuthUrlController } from './controllers/get-auth-url.controller'
import { GetEventsController } from './controllers/get-events.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [
    AuthCallbackController,
    GetAuthUrlController,
    GetEventsController,
  ],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class CalendarModule {}
