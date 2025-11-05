import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { WorkingDaysRepository } from '@src/domain/appointments/application/repositories/working-days-repository'
import type { WorkingDays } from '@src/domain/appointments/enterprise/entities/value-objects/working-days'

export class InMemoryWorkingDaysRepository implements WorkingDaysRepository {
  public items: WorkingDays[] = []

  async findByScheduleConfigurationId(
    id: UniqueEntityId
  ): Promise<WorkingDays[]> {
    return await this.items.filter((item) =>
      item.scheduleConfigurationId.equals(id)
    )
  }
}
