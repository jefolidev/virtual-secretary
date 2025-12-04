import { ScheduleConfigurationRepository } from '@/domain/scheduling/application/repositories/schedule-configuration.repository'
import { ScheduleConfiguration } from '@/domain/scheduling/enterprise/entities/schedule-configuration'

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaScheduleConfigurationMapper } from '../../mappers/prisma-schedule-configuration-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaScheduleConfigurationRepository
  implements ScheduleConfigurationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  create(scheduleconfiguration: ScheduleConfiguration): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<ScheduleConfiguration[]> {
    throw new Error('Method not implemented.')
  }

  async findByProfessionalId(
    professionalId: string
  ): Promise<ScheduleConfiguration> {
    const scheduleConfiguration =
      await this.prisma.scheduleConfiguration.findFirst({
        where: {
          professionalId,
        },
      })

    if (!scheduleConfiguration) {
      throw new NotFoundException()
    }

    return PrismaScheduleConfigurationMapper.toDomain(scheduleConfiguration)
  }
  save(scheduleconfiguration: ScheduleConfiguration): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
