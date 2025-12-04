import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ScheduleConfigurationRepository } from '@/domain/scheduling/application/repositories/schedule-configuration.repository'
import { ScheduleConfiguration } from '@/domain/scheduling/enterprise/entities/schedule-configuration'

class PrismaScheduleConfigurationRepository
  implements ScheduleConfigurationRepository
{
  create(scheduleconfiguration: ScheduleConfiguration): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<ScheduleConfiguration[]> {
    throw new Error('Method not implemented.')
  }
  findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<ScheduleConfiguration> {
    throw new Error('Method not implemented.')
  }
  save(scheduleconfiguration: ScheduleConfiguration): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
