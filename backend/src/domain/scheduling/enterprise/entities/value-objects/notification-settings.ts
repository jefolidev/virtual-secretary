import type { Optional } from '@/core/entities/types/optional'
import { ValueObject } from '@/core/entities/value-object'

export type NotificationChannel = 'EMAIL' | 'WHATSAPP'

export type NotificationType =
  | 'NEW_APPOINTMENT'
  | 'CANCELLATION'
  | 'CONFIRMATION'
  | 'DAILY_SUMMARY'
  | 'CONFIRMED_LIST'
  | 'PAYMENT_STATUS'
  | 'WELCOME'
  | 'REMOVAL'

interface NotificationSettingsProps {
  channels: NotificationChannel[]
  enabledTypes: NotificationType[]
  reminderBeforeMinutes: number
  dailySummaryTime: string
}

export class NotificationSettings extends ValueObject<NotificationSettingsProps> {
  get channels() {
    return this.props.channels
  }

  set channels(channels: NotificationChannel[]) {
    this.props.channels = channels
  }

  get enabledTypes() {
    return this.props.enabledTypes
  }

  set enabledTypes(enabledTypes: NotificationType[]) {
    this.props.enabledTypes = enabledTypes
  }

  get reminderBeforeMinutes() {
    return this.props.reminderBeforeMinutes
  }

  set reminderBeforeMinutes(reminderBeforeMinutes: number) {
    this.props.reminderBeforeMinutes = reminderBeforeMinutes
  }

  get dailySummaryTime() {
    return this.props.dailySummaryTime
  }

  set dailySummaryTime(dailySummaryTime: string) {
    this.props.dailySummaryTime = dailySummaryTime
  }

  static create(
    props: Optional<NotificationSettingsProps, 'reminderBeforeMinutes'>,
  ): NotificationSettings {
    if (props.channels.length === 0) {
      throw new Error('Notification settings must have at least one channel')
    }

    if (props.reminderBeforeMinutes && props.reminderBeforeMinutes < 10) {
      throw new Error('Reminder before minutes must be at least 10 minutes')
    }

    return new NotificationSettings({
      ...props,
      reminderBeforeMinutes: props.reminderBeforeMinutes ?? 10,
    })
  }
}
