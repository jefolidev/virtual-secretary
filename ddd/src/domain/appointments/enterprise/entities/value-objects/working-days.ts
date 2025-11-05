// working-day.ts
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export class WorkingDays {
  private constructor(private readonly _day: DayOfWeek) {}

  get value() {
    return this._day
  }

  equals(other: WorkingDays): boolean {
    return this._day === other._day
  }

  static create(day: DayOfWeek) {
    return new WorkingDays(day)
  }
}
