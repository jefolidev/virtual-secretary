import type { Optional } from '@src/core/entities/types/optional'

type NotificationChannel = 'EMAIL' | 'WHATSAPP'

type NotificationType =
  | 'NEW_APPOINTMENT'
  | 'CANCELLATION'
  | 'CONFIRMATION'
  | 'DAILY_SUMMARY'
  | 'CONFIRMED_LIST'
  | 'PAYMENT_STATUS'

interface NotificationSettingsProps {
  channels: NotificationChannel[]
  enabledTypes: NotificationType[]
  reminderBeforeMinutes: number
  dailySummaryTime: string
}

export class NotificationSettings {
  public readonly channels: NotificationChannel[]
  public readonly enabledTypes: NotificationType[]
  public reminderBeforeMinutes: number
  public dailySummaryTime: string

  constructor(props: NotificationSettingsProps) {
    this.channels = props.channels
    this.enabledTypes = props.enabledTypes
    this.reminderBeforeMinutes = props.reminderBeforeMinutes
    this.dailySummaryTime = props.dailySummaryTime
  }

  static create(
    props: Optional<NotificationSettingsProps, 'reminderBeforeMinutes'>
  ): NotificationSettings {
    if (props.channels.length === 0) {
      throw new Error('Notification settings must have at least one channel')
    }

    if (props.reminderBeforeMinutes && props.reminderBeforeMinutes < 10) {
      throw new Error('Reminder before minutes must be at least 10 minutes')
    }

    return new NotificationSettings({ ...props, reminderBeforeMinutes: 10 })
  }
}
