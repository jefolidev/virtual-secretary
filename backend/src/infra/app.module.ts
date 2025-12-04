import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { envSchema } from './env'
import { AuthenticateController } from './http/controllers/authenticate.controller'
import { CreateAccountController } from './http/controllers/create-account.controller'
import { CreateOrganizationController } from './http/controllers/create-organization.controller'
import { FetchClientController } from './http/controllers/fetch-clients.controller'
import { FetchOrganizationController } from './http/controllers/fetch-organizations.controller'
import { FetchProfessionalController } from './http/controllers/fetch-professionals.controller'
import { PrismaService } from './prisma/prisma.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (env) => envSchema.parse(env),
    }),
    AuthModule,
  ],
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
export class AppModule {}
