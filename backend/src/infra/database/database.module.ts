import { OrganizationRepository } from '@/domain/organization/application/repositories/organization.repository'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { CancellationPolicyRepository } from '@/domain/scheduling/application/repositories/cancellation-policy.repository'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { ScheduleConfigurationRepository } from '@/domain/scheduling/application/repositories/schedule-configuration.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { PrismaAppointmentsRepository } from './prisma/repositories/prisma-appointments.repository'
import { PrismaCancellationPolicyRepository } from './prisma/repositories/prisma-cancellation-policy.repository'
import { PrismaClientRepository } from './prisma/repositories/prisma-client.repository'
import { PrismaOrganizationRepository } from './prisma/repositories/prisma-organization.repository'
import { PrismaProfessionalRepository } from './prisma/repositories/prisma-professional.repository'
import { PrismaScheduleConfigurationRepository } from './prisma/repositories/prisma-schedule-configuration.repository'
import { PrismaUserRepository } from './prisma/repositories/prisma-user.repository'

@Module({
  providers: [
    PrismaService,
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
      provide: CancellationPolicyRepository,
      useClass: PrismaCancellationPolicyRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [
    PrismaService,
    AppointmentsRepository,
    CancellationPolicyRepository,
    ClientRepository,
    OrganizationRepository,
    ProfessionalRepository,
    ScheduleConfigurationRepository,
    UserRepository,
  ],
})
export class DatabaseModule {}
