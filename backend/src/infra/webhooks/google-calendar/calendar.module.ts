import { OnAppointmentCreated } from '@/domain/scheduling/application/subscribers/on-appointment-created'
import { AuthenticateWithGoogleUseCase } from '@/domain/scheduling/application/use-cases/authenticate-user-with-google'
import { CheckGoogleCalendarConnectionUseCase } from '@/domain/scheduling/application/use-cases/check-google-calendar-connection'
import { CreateCalendarEventUseCase } from '@/domain/scheduling/application/use-cases/create-calendar-event'
import { FetchProfessionalEventsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-events'
import { GetAuthUrlUseCase } from '@/domain/scheduling/application/use-cases/get-google-auth-url'
import { HandleOAuthCallbackUseCase } from '@/domain/scheduling/application/use-cases/handle-oauth-callback'
import { GoogleAuthStrategy } from '@/infra/auth/google-auth.strategy'
import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { CheckGoogleConnectionController } from './controllers/check-google-connection.controller'
import { GetAuthUrlController } from './controllers/get-auth-url.controller'
import { GetEventsController } from './controllers/get-events.controller'
import { GoogleAuthController } from './controllers/google-auth.controller'
import { HandleOAuthCallbackController } from './controllers/handle-oauth-callback.controller'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    GetAuthUrlController,
    GetEventsController,
    HandleOAuthCallbackController,
    CheckGoogleConnectionController,
    GoogleAuthController,
  ],
  providers: [
    CreateCalendarEventUseCase,
    FetchProfessionalEventsUseCase,
    GetAuthUrlUseCase,
    HandleOAuthCallbackUseCase,
    CheckGoogleCalendarConnectionUseCase,
    AuthenticateWithGoogleUseCase,
    OnAppointmentCreated,
    GoogleAuthStrategy,
  ],
  exports: [],
})
export class CalendarModule {}
