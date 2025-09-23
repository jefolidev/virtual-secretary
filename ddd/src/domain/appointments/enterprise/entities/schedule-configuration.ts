import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import dayjs from 'dayjs'

interface ScheduleConfigurationProps {
  professionalId: UniqueEntityId
  workingDays: number[]
  workingHours: { start: string; end: string }
  sessionDurationMinutes: number
  bufferIntervalMinutes: number
  holidays: Date[]
  enableGoogleMeet: boolean
  createdAt: Date
  updatedAt?: Date
}

export class ScheduleConfiguration extends Entity<ScheduleConfigurationProps> {
  get professionalId() {
    return this.props.professionalId
  }

  get workingDays() {
    return this.props.workingDays
  }

  set workingDays(workingDays: number[]) {
    if (workingDays.length >= 7) {
      throw new Error('workingDays must have 7 days')
    }

    this.props.workingDays = workingDays
    this.updatedAt = new Date()
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
    this.updatedAt = new Date()
  }

  get sessionDurationMinutes() {
    return this.props.sessionDurationMinutes
  }

  set sessionDurationMinutes(sessionDurationMinutes: number) {
    if (sessionDurationMinutes < 10) {
      throw new Error('sessionDurationMinutes must be at least 10 minutes')
    }

    this.props.sessionDurationMinutes = sessionDurationMinutes
    this.updatedAt = new Date()
  }

  get bufferIntervalMinutes() {
    return this.props.bufferIntervalMinutes
  }

  set bufferIntervalMinutes(bufferIntervalMinutes: number) {
    if (bufferIntervalMinutes < 10) {
      throw new Error('bufferIntervalMinutes must be at least 10 minutes')
    }

    this.props.bufferIntervalMinutes = bufferIntervalMinutes
    this.updatedAt = new Date()
  }

  get holidays() {
    return this.props.holidays
  }

  set holidays(holidays: Date[]) {
    this.props.holidays = holidays
    this.updatedAt = new Date()
  }

  get enableGoogleMeet() {
    return this.props.enableGoogleMeet
  }

  set enableGoogleMeet(enableGoogleMeet: boolean) {
    this.props.enableGoogleMeet = enableGoogleMeet
    this.updatedAt = new Date()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? new Date()
  }

  set updatedAt(updatedAt: Date) {
    this.props.updatedAt = updatedAt
  }

  static create(
    props: Optional<
      ScheduleConfigurationProps,
      'createdAt' | 'sessionDurationMinutes' | 'bufferIntervalMinutes'
    >,
    id?: UniqueEntityId
  ) {
    const scheduleConfiguration = new ScheduleConfiguration(
      {
        ...props,
        sessionDurationMinutes: 60,
        bufferIntervalMinutes: 10,
        createdAt: new Date(),
      },
      id
    )

    return scheduleConfiguration
  }
}
