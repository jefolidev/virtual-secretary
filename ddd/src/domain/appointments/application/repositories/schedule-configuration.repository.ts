import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'

export interface ScheduleConfigurationRepository {
  create(scheduleconfiguration: ScheduleConfiguration): Promise<void>
  findMany(): Promise<ScheduleConfiguration[]>
  findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<ScheduleConfiguration | undefined>
  save(scheduleconfiguration: ScheduleConfiguration): Promise<void>
}
