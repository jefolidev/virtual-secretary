import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ScheduleConfigurationRepository } from '@/domain/scheduling/application/repositories/schedule-configuration.repository'
import type { ScheduleConfiguration } from '@/domain/scheduling/enterprise/entities/schedule-configuration'

export class InMemoryScheduleConfigurationRepository
  implements ScheduleConfigurationRepository
{
  public items: ScheduleConfiguration[] = []

  async create(scheduleconfiguration: ScheduleConfiguration): Promise<void> {
    await this.items.push(scheduleconfiguration)
  }

  async findMany(): Promise<ScheduleConfiguration[]> {
    return await this.items
  }

  async findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<ScheduleConfiguration> {
    const scheduleConfigurations = await this.items.find(
      (scheduleconfiguration) =>
        scheduleconfiguration.professionalId.equals(professionalId)
    )

    if (!scheduleConfigurations) {
      throw new Error('schedule configuration not found')
    }

    return scheduleConfigurations
  }

  async save(scheduleconfiguration: ScheduleConfiguration): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === scheduleconfiguration.id
    )

    this.items[itemIndex] = scheduleconfiguration
  }
}
