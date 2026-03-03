export type NotificationType =
  | 'NEW_APPOINTMENT'
  | 'CANCELLATION'
  | 'CONFIRMATION'
  | 'DAILY_SUMMARY'
  | 'CONFIRMED_LIST'
  | 'PAYMENT_STATUS'
  | 'WELCOME'
  | 'REMOVAL'
  | 'FIRST_REMINDER'
  | 'USER_CONFIRMATION'
  | 'FINAL_REMINDER'
  | 'CALENDAR_SYNC_UPDATED'
  | 'CALENDAR_SYNC_CANCELLED'

export interface Notification {
  id: string
  recipientId: string
  title: string
  content: string
  reminderType: NotificationType
  createdAt: Date
  readAt?: Date | null
}
