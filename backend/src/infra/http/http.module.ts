import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateOrganizationController } from './controllers/create-organization.controller'
import { FetchClientController } from './controllers/fetch-clients.controller'
import { FetchOrganizationController } from './controllers/fetch-organizations.controller'
import { FetchProfessionalController } from './controllers/fetch-professionals.controller'

@Module({
  controllers: [
    AuthenticateController,
    CreateAccountController,
    CreateOrganizationController,
    FetchClientController,
    FetchOrganizationController,
    FetchProfessionalController,
  ],
  providers: [PrismaService],
})
export class HttpModule {}
