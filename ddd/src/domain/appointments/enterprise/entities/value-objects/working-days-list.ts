import { WatchedList } from '@src/core/entities/watched-list'
import type { WorkingDay } from './working-days'

export class WorkingDaysList extends WatchedList<WorkingDay> {
  compareItems(a: WorkingDay, b: WorkingDay): boolean {
    return a.value === b.value
  }
}
