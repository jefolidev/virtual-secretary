import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  ScheduleConfiguration,
  type ScheduleConfigurationProps,
} from '@/domain/scheduling/enterprise/entities/schedule-configuration'
import { WorkingDaysList } from '@/domain/scheduling/enterprise/entities/value-objects/working-days-list'

export function makeScheduleConfiguration(
  override?: Partial<ScheduleConfigurationProps>,
  id?: UniqueEntityId
) {
  const scheduleconfiguration: ScheduleConfiguration =
    ScheduleConfiguration.create(
      {
        professionalId: new UniqueEntityId(),
        enableGoogleMeet: true,
        workingDays: new WorkingDaysList([1, 2, 3, 4, 5]),
        workingHours: {
          start: '08:00',
          end: '17:00',
        },
        bufferIntervalMinutes: 10,
        sessionDurationMinutes: 60,
        holidays: [],
        ...override,
      },
      id
    )

  return scheduleconfiguration
}
