import { CreateAppointmentUseCase } from '@/domain/scheduling/application/use-cases/create-schedule'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateOrganizationController } from './controllers/create-organization.controller'
import { CreateScheduleController } from './controllers/create-schedule.controller'
import { FetchClientController } from './controllers/fetch-clients.controller'
import { FetchOrganizationController } from './controllers/fetch-organizations.controller'
import { FetchProfessionalController } from './controllers/fetch-professionals.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [
    AuthenticateController,
    CreateAccountController,
    CreateScheduleController,
    CreateOrganizationController,
    FetchClientController,
    FetchOrganizationController,
    FetchProfessionalController,
  ],
  providers: [CreateAppointmentUseCase],
})
export class HttpModule {}
