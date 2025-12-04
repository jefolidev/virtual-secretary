import { Module } from '@nestjs/common'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateOrganizationController } from './controllers/create-organization.controller'
import { FetchClientController } from './controllers/fetch-clients.controller'
import { FetchOrganizationController } from './controllers/fetch-organizations.controller'
import { FetchProfessionalController } from './controllers/fetch-professionals.controller'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [
    AuthenticateController,
    CreateAccountController,
    CreateOrganizationController,
    FetchClientController,
    FetchOrganizationController,
    FetchProfessionalController,
  ],
})
export class HttpModule {}
