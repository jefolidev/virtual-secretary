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

export interface UserSettings {
  notifications: {
    newAppointments: boolean
    cancellations: boolean
    confirmations: boolean
    dailySummary: boolean
    confirmedList: boolean
    payments: boolean
  }
  notificationChannels: {
    email: boolean
    whatsapp: boolean
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
  notifications: UserSettings['notifications']
  notificationChannels: UserSettings['notificationChannels']
}

export interface UpdateUserConsultationsData {
  consultations: UserSettings['consultations']
}
