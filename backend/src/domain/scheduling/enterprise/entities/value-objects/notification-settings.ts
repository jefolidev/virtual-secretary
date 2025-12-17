import type { Optional } from '@/core/entities/types/optional'
import { ValueObject } from '@/core/entities/value-object'

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

export class NotificationSettings extends ValueObject<NotificationSettingsProps> {
  get channels() {
    return this.props.channels
  }

  get enabledTypes() {
    return this.props.enabledTypes
  }

  get reminderBeforeMinutes() {
    return this.props.reminderBeforeMinutes
  }

  get dailySummaryTime() {
    return this.props.dailySummaryTime
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
