import { AggregateRoot } from '@/core/entities/aggregate'
import type { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { GoogleCalendarEvent } from './google-calendar-event'
import { NotificationSettings } from './value-objects/notification-settings'

export interface ProfessionalProps {
  userId?: UniqueEntityId
  organizationId?: UniqueEntityId | null
  notificationSettings?: NotificationSettings
  cancellationPolicyId?: UniqueEntityId
  scheduleConfigurationId?: UniqueEntityId
  googleCalendarEvent: GoogleCalendarEvent | null
  sessionPrice: number
  googleConnectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  createdAt: Date
  updatedAt?: Date | null
}

export class Professional extends AggregateRoot<ProfessionalProps> {
  get organizationId() {
    return this.props.organizationId || null
  }

  set organizationId(organizationId: UniqueEntityId | null) {
    this.props.organizationId = organizationId || null
    this.touch()
  }

  get userId() {
    return this.props.userId
  }

  get notificationSettings() {
    return this.props.notificationSettings
  }

  set notificationSettings(
    notificationSettings: NotificationSettings | undefined,
  ) {
    this.props.notificationSettings = notificationSettings
    this.touch()
  }

  get scheduleConfigurationId() {
    return this.props.scheduleConfigurationId
  }

  set scheduleConfigurationId(
    scheduleConfigurationId: UniqueEntityId | undefined,
  ) {
    this.props.scheduleConfigurationId = scheduleConfigurationId
    this.touch()
  }

  get cancellationPolicyId() {
    return this.props.cancellationPolicyId
  }

  set cancellationPolicyId(cancellationPolicyId: UniqueEntityId | undefined) {
    this.props.cancellationPolicyId = cancellationPolicyId
    this.touch()
  }

  get googleConnectionStatus() {
    return this.props.googleConnectionStatus
  }

  set googleConnectionStatus(
    googleConnectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR',
  ) {
    this.props.googleConnectionStatus = googleConnectionStatus
  }

  get sessionPrice() {
    return this.props.sessionPrice
  }

  set sessionPrice(sessionPrice: number) {
    this.props.sessionPrice = sessionPrice
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? this.props.createdAt
  }

  get googleCalendarEvent() {
    return this.props.googleCalendarEvent
  }

  set googleCalendarEvent(googleCalendarEvent: GoogleCalendarEvent | null) {
    this.props.googleCalendarEvent = googleCalendarEvent
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      ProfessionalProps,
      | 'createdAt'
      | 'cancellationPolicyId'
      | 'scheduleConfigurationId'
      | 'notificationSettings'
      | 'googleCalendarEvent'
      | 'googleConnectionStatus'
    >,
    id?: UniqueEntityId,
  ) {
    const professional = new Professional(
      {
        ...props,
        googleConnectionStatus: props.googleConnectionStatus ?? 'CONNECTED',
        googleCalendarEvent: props.googleCalendarEvent || null,
        cancellationPolicyId: props.cancellationPolicyId ?? undefined,
        scheduleConfigurationId: props.scheduleConfigurationId ?? undefined,
        notificationSettings: props.notificationSettings,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return professional
  }
}
