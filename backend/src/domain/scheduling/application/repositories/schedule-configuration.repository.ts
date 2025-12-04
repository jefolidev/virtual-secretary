import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'

export interface ScheduleConfigurationRepository {
  create(scheduleconfiguration: ScheduleConfiguration): Promise<void>
  findMany(): Promise<ScheduleConfiguration[]>
  findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<ScheduleConfiguration>
  save(scheduleconfiguration: ScheduleConfiguration): Promise<void>
}
