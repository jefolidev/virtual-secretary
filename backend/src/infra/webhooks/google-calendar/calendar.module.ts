import { CreateCalendarEventUseCase } from '@/domain/scheduling/application/use-cases/create-calendar-event'
import { FetchProfessionalEventsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-events'
import { GetAuthUrlUseCase } from '@/domain/scheduling/application/use-cases/get-google-auth-url'
import { HandleOAuthCallbackUseCase } from '@/domain/scheduling/application/use-cases/handle-oauth-callback'
import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { GetAuthUrlController } from './controllers/get-auth-url.controller'
import { GetEventsController } from './controllers/get-events.controller'
import { HandleOAuthCallbackController } from './controllers/handle-oauth-callback.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [
    GetAuthUrlController,
    GetEventsController,
    HandleOAuthCallbackController,
  ],
  providers: [
    CreateCalendarEventUseCase,
    FetchProfessionalEventsUseCase,
    GetAuthUrlUseCase,
    HandleOAuthCallbackUseCase,
  ],
  exports: [],
})
export class CalendarModule {}
