import { NotificationsRepository } from '@/domain/notifications/application/repositories/notification.repository'
import { OrganizationRepository } from '@/domain/organization/application/repositories/organization.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'

import { AddressRepository } from '@/domain/scheduling/application/repositories/address.repository'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { CancellationPolicyRepository } from '@/domain/scheduling/application/repositories/cancellation-policy.repository'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ScheduleConfigurationRepository } from '@/domain/scheduling/application/repositories/schedule-configuration.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-ioredis-yet'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { Env } from '../env/env'
import { PrismaService } from './prisma/prisma.service'
import { PrismaAddressRepository } from './prisma/repositories/prisma-address.repository'
import { PrismaAppointmentsRepository } from './prisma/repositories/prisma-appointments.repository'
import { PrismaCancellationPolicyRepository } from './prisma/repositories/prisma-cancellation-policy.repository'
import { PrismaClientRepository } from './prisma/repositories/prisma-client.repository'
import { PrismaNotificationsRepository } from './prisma/repositories/prisma-notification.repository'
import { PrismaProfessionalRepository } from './prisma/repositories/prisma-professional.repository'

import { PrismaOrganizationRepository } from './prisma/repositories/prisma-organization.repository'
import { PrismaScheduleConfigurationRepository } from './prisma/repositories/prisma-schedule-configuration.repository'
import { PrismaUserRepository } from './prisma/repositories/prisma-user.repository'

@Module({
  imports: [
    CryptographyModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Env, true>) => ({
        store: await redisStore({
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          ttl: 60 * 60 * 24, // 24 hours
        }),
      }),
    }),
  ],
  providers: [
    PrismaService,
    {
      provide: AddressRepository,
      useClass: PrismaAddressRepository,
    },
    {
      provide: AppointmentsRepository,
      useClass: PrismaAppointmentsRepository,
    },
    {
      provide: CancellationPolicyRepository,
      useClass: PrismaCancellationPolicyRepository,
    },
    {
      provide: ClientRepository,
      useClass: PrismaClientRepository,
    },
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
    {
      provide: ProfessionalRepository,
      useClass: PrismaProfessionalRepository,
    },
    {
      provide: ScheduleConfigurationRepository,
      useClass: PrismaScheduleConfigurationRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },
  ],
  exports: [
    CacheModule,
    PrismaService,
    AppointmentsRepository,
    AddressRepository,
    CancellationPolicyRepository,
    ClientRepository,
    OrganizationRepository,
    ProfessionalRepository,
    ScheduleConfigurationRepository,
    NotificationsRepository,
    UserRepository,
  ],
})
export class DatabaseModule {}
