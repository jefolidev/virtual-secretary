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

  async create(scheduleConfiguration: ScheduleConfiguration): Promise<void> {
    const data = PrismaScheduleConfigurationMapper.toPrisma(
      scheduleConfiguration
    )
    await this.prisma.scheduleConfiguration.create({ data })
  }

  async findMany(): Promise<ScheduleConfiguration[]> {
    const scheduleConfigurations =
      await this.prisma.scheduleConfiguration.findMany()
    return scheduleConfigurations.map(
      PrismaScheduleConfigurationMapper.toDomain
    )
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

  async save(scheduleConfiguration: ScheduleConfiguration): Promise<void> {
    const data = PrismaScheduleConfigurationMapper.toPrisma(
      scheduleConfiguration
    )

    await Promise.all([
      this.prisma.scheduleConfiguration.update({
        where: { id: scheduleConfiguration.id.toString() },
        data,
      }),
    ])
  }
}
