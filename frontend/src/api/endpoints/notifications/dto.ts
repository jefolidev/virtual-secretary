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

export interface Notification {
  recipientId: string
  title: string
  content: string
  reminderType: NotificationType
  createdAt: Date
  readAt?: Date | null
}
