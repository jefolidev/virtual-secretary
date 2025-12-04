import type { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'

export interface ScheduleConfigurationRepository {
  create(scheduleconfiguration: ScheduleConfiguration): Promise<void>
  findMany(): Promise<ScheduleConfiguration[]>
  findByProfessionalId(professionalId: string): Promise<ScheduleConfiguration>
  save(scheduleconfiguration: ScheduleConfiguration): Promise<void>
}
