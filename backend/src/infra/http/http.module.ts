import { CreateClientUseCase } from '@/domain/scheduling/application/use-cases/create-client'
import { CreateProfessionalUseCase } from '@/domain/scheduling/application/use-cases/create-professional'
import { CreateAppointmentUseCase } from '@/domain/scheduling/application/use-cases/create-schedule'
import { RegisterUserUseCase } from '@/domain/scheduling/application/use-cases/register-user'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateOrganizationController } from './controllers/create-organization.controller'
import { CreateScheduleController } from './controllers/create-schedule.controller'
import { FetchClientController } from './controllers/fetch-clients.controller'
import { FetchOrganizationController } from './controllers/fetch-organizations.controller'
import { FetchProfessionalController } from './controllers/fetch-professionals.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    CreateAccountController,
    CreateScheduleController,
    CreateOrganizationController,
    FetchClientController,
    FetchOrganizationController,
    FetchProfessionalController,
  ],
  providers: [
    CreateAppointmentUseCase,
    CreateClientUseCase,
    CreateProfessionalUseCase,
    RegisterUserUseCase,
  ],
})
export class HttpModule {}
