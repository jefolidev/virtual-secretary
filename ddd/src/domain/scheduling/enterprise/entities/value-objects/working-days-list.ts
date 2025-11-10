import { WatchedList } from '@src/core/entities/watched-list'

export class WorkingDaysList extends WatchedList<number> {
  public compareItems(a: number, b: number): boolean {
    return a === b
  }
}
