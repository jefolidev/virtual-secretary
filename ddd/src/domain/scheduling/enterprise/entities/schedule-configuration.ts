import { AggregateRoot } from '@src/core/entities/aggregate'
import type { Optional } from '@src/core/entities/types/optional'
import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { WorkingDaysList } from './value-objects/working-days-list'

dayjs.extend(customParseFormat)

export interface ScheduleConfigurationProps {
  professionalId: UniqueEntityId
  workingDays: WorkingDaysList
  workingHours: { start: string; end: string }
  sessionDurationMinutes: number
  bufferIntervalMinutes: number
  holidays: Date[]
  enableGoogleMeet: boolean
  createdAt: Date
  updatedAt?: Date
}

export class ScheduleConfiguration extends AggregateRoot<ScheduleConfigurationProps> {
  get professionalId() {
    return this.props.professionalId
  }

  get workingDays() {
    return this.props.workingDays
  }

  set workingDays(workingDays: WorkingDaysList) {
    if (workingDays.currentItems.length > 7) {
      throw new Error('Working days must have only 7 days')
    }

    this.props.workingDays = workingDays
    this.touch()
  }

  get workingHours() {
    return this.props.workingHours
  }

  set workingHours(workingHours: { start: string; end: string }) {
    const start = dayjs(workingHours.start, 'HH:mm', true)
    const end = dayjs(workingHours.end, 'HH:mm', true)

    if (!start.isValid() || !end.isValid()) {
      throw new Error('Invalid time format, must be HH:mm')
    }

    if (
      start.hour() < 0 ||
      start.hour() > 23 ||
      end.hour() < 0 ||
      end.hour() > 23
    ) {
      throw new Error('workingHours must be between 00:00 and 23:59')
    }

    if (start.isAfter(end)) {
      throw new Error('workingHours start must be before end')
    }

    this.props.workingHours = workingHours
    this.touch()
  }

  get sessionDurationMinutes() {
    return this.props.sessionDurationMinutes
  }

  set sessionDurationMinutes(sessionDurationMinutes: number) {
    if (sessionDurationMinutes < 10) {
      throw new Error('sessionDurationMinutes must be at least 10 minutes')
    }

    this.props.sessionDurationMinutes = sessionDurationMinutes
    this.touch()
  }

  get bufferIntervalMinutes() {
    return this.props.bufferIntervalMinutes
  }

  set bufferIntervalMinutes(bufferIntervalMinutes: number) {
    if (bufferIntervalMinutes < 10) {
      throw new Error('bufferIntervalMinutes must be at least 10 minutes')
    }

    this.props.bufferIntervalMinutes = bufferIntervalMinutes
    this.touch()
  }

  get holidays() {
    return this.props.holidays
  }

  set holidays(holidays: Date[]) {
    this.props.holidays = holidays
    this.touch()
  }

  get enableGoogleMeet() {
    return this.props.enableGoogleMeet
  }

  set enableGoogleMeet(enableGoogleMeet: boolean) {
    this.props.enableGoogleMeet = enableGoogleMeet
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? this.props.createdAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      ScheduleConfigurationProps,
      | 'createdAt'
      | 'sessionDurationMinutes'
      | 'bufferIntervalMinutes'
      | 'workingDays'
    >,
    id?: UniqueEntityId
  ) {
    const scheduleConfiguration = new ScheduleConfiguration(
      {
        ...props,
        sessionDurationMinutes: props.sessionDurationMinutes ?? 60,
        bufferIntervalMinutes: props.bufferIntervalMinutes ?? 10,
        workingDays: props.workingDays ?? new WorkingDaysList([]),
        createdAt: new Date(),
      },
      id
    )

    return scheduleConfiguration
  }
}
