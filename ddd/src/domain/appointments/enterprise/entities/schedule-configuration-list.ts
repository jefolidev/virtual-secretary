import { WatchedList } from '@src/core/entities/watched-list'
import type { ScheduleConfiguration } from './schedule-configuration'

export class ScheduleConfigurationList extends WatchedList<ScheduleConfiguration> {
  compareItems(a: ScheduleConfiguration, b: ScheduleConfiguration): boolean {
    return a.workingDays === b.workingDays
  }
}
