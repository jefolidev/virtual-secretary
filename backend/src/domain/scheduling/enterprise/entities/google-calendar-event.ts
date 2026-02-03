import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type SyncStatus = 'SYNCED' | 'PENDING' | 'ERROR'

export interface GoogleCalendarEventProps {
  appointmentId: UniqueEntityId
  professionalId: UniqueEntityId
  googleEventLink: string
  summary: string
  description?: string | null
  startDateTime: Date
  endDateTime: Date
  syncStatus: SyncStatus
  lastSyncedAt: Date
  createdAt: Date
  updatedAt?: Date | null
}

export class GoogleCalendarEvent extends Entity<GoogleCalendarEventProps> {
  get appointmentId() {
    return this.props.appointmentId
  }

  get professionalId() {
    return this.props.professionalId
  }

  get googleEventLink() {
    return this.props.googleEventLink
  }

  set googleEventLink(googleEventLink: string) {
    this.props.googleEventLink = googleEventLink
    this.touch()
  }

  get summary() {
    return this.props.summary
  }

  set summary(summary: string) {
    this.props.summary = summary
    this.touch()
  }

  get description() {
    return this.props.description
  }

  set description(description: string | null | undefined) {
    this.props.description = description
    this.touch()
  }

  get startDateTime() {
    return this.props.startDateTime
  }

  set startDateTime(startDateTime: Date) {
    this.props.startDateTime = startDateTime
    this.touch()
  }

  get endDateTime() {
    return this.props.endDateTime
  }

  set endDateTime(endDateTime: Date) {
    this.props.endDateTime = endDateTime
    this.touch()
  }

  get syncStatus() {
    return this.props.syncStatus
  }

  set syncStatus(syncStatus: SyncStatus) {
    this.props.syncStatus = syncStatus
    this.props.lastSyncedAt = new Date()
    this.touch()
  }

  get lastSyncedAt() {
    return this.props.lastSyncedAt
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  markAsSynced() {
    this.props.syncStatus = 'SYNCED'
    this.props.lastSyncedAt = new Date()
    this.touch()
  }

  markAsPending() {
    this.props.syncStatus = 'PENDING'
    this.touch()
  }

  markAsError() {
    this.props.syncStatus = 'ERROR'
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      GoogleCalendarEventProps,
      'createdAt' | 'updatedAt' | 'syncStatus' | 'lastSyncedAt'
    >,
    id?: UniqueEntityId,
  ) {
    const calendarEvent = new GoogleCalendarEvent(
      {
        ...props,
        syncStatus: props.syncStatus ?? 'SYNCED',
        lastSyncedAt: props.lastSyncedAt ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return calendarEvent
  }
}
