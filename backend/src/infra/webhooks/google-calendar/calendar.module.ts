import { OnAppointmentCanceledSync } from '@/domain/scheduling/application/subscribers/on-appointment-canceled-sync'
import { OnAppointmentCreated } from '@/domain/scheduling/application/subscribers/on-appointment-created'
import { OnAppointmentRescheduled } from '@/domain/scheduling/application/subscribers/on-appointment-rescheduled'
import { AuthenticateWithSyncedGoogleUseCase } from '@/domain/scheduling/application/use-cases/authenticate-with-synced-google'
import { CheckGoogleCalendarConnectionUseCase } from '@/domain/scheduling/application/use-cases/check-google-calendar-connection'
import { CreateCalendarEventUseCase } from '@/domain/scheduling/application/use-cases/create-calendar-event'
import { EditCalendarEventUseCase } from '@/domain/scheduling/application/use-cases/edit-calendar-event'
import { FetchProfessionalEventsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-events'
import { GetAuthUrlUseCase } from '@/domain/scheduling/application/use-cases/get-google-auth-url'
import { HandleCalendarPushNotificationUseCase } from '@/domain/scheduling/application/use-cases/handle-calendar-push-notification'
import { HandleOAuthCallbackUseCase } from '@/domain/scheduling/application/use-cases/handle-oauth-callback'
import { RegisterCalendarWatchUseCase } from '@/domain/scheduling/application/use-cases/register-calendar-watch'
import { SendNotificationUseCase } from '@/domain/notifications/application/use-cases/send-notification'
import { GoogleAuthStrategy } from '@/infra/auth/google-auth.strategy'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { CheckGoogleConnectionController } from './controllers/check-google-connection.controller'
import { GetAuthUrlController } from './controllers/get-auth-url.controller'
import { GetEventsController } from './controllers/get-events.controller'
import { GoogleAuthController } from './controllers/google-auth.controller'
import { GoogleCalendarSyncController } from './controllers/google-calendar-sync.controller'
import { GoogleOAuthCallbackController } from './controllers/handle-oauth-callback.controller'
import { RenewCalendarWatchService } from './renew-calendar-watch.service'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    GetAuthUrlController,
    GetEventsController,
    GoogleOAuthCallbackController,
    CheckGoogleConnectionController,
    GoogleAuthController,
    GoogleCalendarSyncController,
  ],
  providers: [
    CreateCalendarEventUseCase,
    EditCalendarEventUseCase,
    FetchProfessionalEventsUseCase,
    GetAuthUrlUseCase,
    HandleOAuthCallbackUseCase,
    CheckGoogleCalendarConnectionUseCase,
    AuthenticateWithSyncedGoogleUseCase,
    RegisterCalendarWatchUseCase,
    HandleCalendarPushNotificationUseCase,
    SendNotificationUseCase,
    OnAppointmentCreated,
    OnAppointmentCanceledSync,
    OnAppointmentRescheduled,
    RenewCalendarWatchService,
    GoogleAuthStrategy,
  ],
  exports: [],
})
export class CalendarModule {}
