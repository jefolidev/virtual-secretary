import type { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'

export abstract class ScheduleConfigurationRepository {
  abstract create(scheduleconfiguration: ScheduleConfiguration): Promise<void>
  abstract findMany(): Promise<ScheduleConfiguration[]>
  abstract findByProfessionalId(
    professionalId: string
  ): Promise<ScheduleConfiguration>
  abstract save(scheduleconfiguration: ScheduleConfiguration): Promise<void>
}
