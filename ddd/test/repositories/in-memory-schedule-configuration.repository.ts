import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { ScheduleConfigurationRepository } from '@src/domain/appointments/application/repositories/schedule-configuration.repository'
import type { ScheduleConfiguration } from '@src/domain/appointments/enterprise/entities/schedule-configuration'

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
  ): Promise<ScheduleConfiguration | undefined> {
    const scheduleConfigurations = await this.items.find(
      (scheduleconfiguration) =>
        scheduleconfiguration.professionalId.equals(professionalId)
    )

    return scheduleConfigurations
  }

  async save(scheduleconfiguration: ScheduleConfiguration): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === scheduleconfiguration.id
    )

    this.items[itemIndex] = scheduleconfiguration
  }
}
