export interface User {
  id: string
  email: string
  name: string
  cpf?: string
  phone?: string
  address?: string
  profileImage?: string
  role: 'professional' | 'patient'
  createdAt: string
  updatedAt: string
}

export type NotificationType =
  | 'NEW_APPOINTMENT'
  | 'CANCELLATION'
  | 'CONFIRMATION'
  | 'DAILY_SUMMARY'
  | 'CONFIRMED_LIST'
  | 'PAYMENT_STATUS'

export type NotificationChannel = 'EMAIL' | 'WHATSAPP'

export interface UserSettings {
  notificationSettings: {
    enabledTypes?: NotificationType[]
    channels?: NotificationChannel[]
  }
  consultations?: {
    workDays: {
      monday: boolean
      tuesday: boolean
      wednesday: boolean
      thursday: boolean
      friday: boolean
      saturday: boolean
      sunday: boolean
    }
    appointmentDuration: number
    breakTime: number
    startTime: string
    endTime: string
    sessionPrice: number
    minHoursBeforeCancellation: number
    cancelationFeePercentage: number
    minDaysBeforeNextAppointment: number
    allowReschedule: boolean
    cancellationPolicy: string
  }
}

export interface UpdateUserAccountData {
  name?: string
  email?: string
  cpf?: string
  phone?: string
  password?: string
}

export interface UpdateUserNotificationsData {
  enabledTypes?: NotificationType[]
  channels?: NotificationChannel[]
  dailySummaryTime?: string
  reminderBeforeMinutes?: number
  sessionPrice?: number
}

export interface UpdateUserConsultationsData {
  consultations: UserSettings['consultations']
}
