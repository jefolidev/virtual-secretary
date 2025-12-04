import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { PrismaAppointmentsRepository } from './prisma/repositories/prisma-appointments.repository'
import { PrismaCancellationPolicyRepository } from './prisma/repositories/prisma-cancellation-policy.repository'
import { PrismaClientRepository } from './prisma/repositories/prisma-client.repository'
import { PrismaOrganizationRepository } from './prisma/repositories/prisma-organization.repository'
import { PrismaProfessionalRepository } from './prisma/repositories/prisma-professional.repository'
import { PrismaScheduleConfigurationRepository } from './prisma/repositories/prisma-schedule-configuration.repository'

@Module({
  providers: [
    PrismaService,
    PrismaAppointmentsRepository,
    PrismaCancellationPolicyRepository,
    PrismaClientRepository,
    PrismaOrganizationRepository,
    PrismaProfessionalRepository,
    PrismaScheduleConfigurationRepository,
  ],
  exports: [PrismaService],
})
export class DatabaseModule {}
