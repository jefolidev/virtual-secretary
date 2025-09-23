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
  dailySummaryTime?: string
}

export class NotificationSettings {
  constructor({}: NotificationSettingsProps) {}
}
