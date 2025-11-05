import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { WorkingDays } from '../../enterprise/entities/value-objects/working-days'

export interface WorkingDaysRepository {
  findByScheduleConfigurationId(id: UniqueEntityId): Promise<WorkingDays[]>
}
