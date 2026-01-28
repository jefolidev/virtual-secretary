export interface User {
  id: string
  email: string
  name: string
  cpf?: string
  whatsappNumber?: string
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

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface WorkingDaysList {
  currentItems: DayOfWeek[] | null
  initial: DayOfWeek[] | null
  new: DayOfWeek[] | null
  removed: DayOfWeek[] | null
}

export interface UserSettings {
  notificationSettings: {
    enabledTypes?: NotificationType[]
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
  whatsappNumber?: string
  password?: string
}

export interface UpdateProfessionalWorkDaysData {
  newDays: number[]
}

export interface UpdateProfessionalWorkHoursData {
  newStartHour?: string
  newEndHour?: string
}

export interface UpdateProfessional {
  enabledTypes?: NotificationType[]
  dailySummaryTime?: string
  reminderBeforeMinutes?: number
  sessionPrice?: number
}

export interface UpdateScheduleConfigurationData {
  workingHours?: { start?: string; end?: string }
  sessionDurationMinutes?: number
  bufferIntervalMinutes?: number
  enableGoogleMeet?: boolean
  holidays?: Date[]
  workingDays?: WorkingDaysList
}

export interface UpdateCancellationPolicyData {
  bufferIntervalMinutes?: number
  minHoursBeforeCancellation?: number
  minDaysBeforeNextAppointment?: number
  cancelationFeePercentage?: number
  allowReschedule?: boolean
  description?: string
}
