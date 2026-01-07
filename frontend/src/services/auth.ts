import { api } from '@/api/axios'
import type { CancellationPolicy } from '@/api/schemas/cancellation-policy'
import type { ScheduleConfiguration } from '@/api/schemas/schedule-configuration'
import type { SignupData } from '@/contexts/auth-context'

export interface RegisterUserData {
  name: string
  email: string
  password: string
  phone: string
  cpf: string
  birthDate: string
  gender: 'MALE' | 'FEMALE'
  role: 'CLIENT' | 'PROFESSIONAL'

  clientData?: {
    periodPreference: Array<'MORNING' | 'AFTERNOON' | 'EVENING'>
    extraPreferences: string
  }

  professionalData?: {
    sessionPrice: number
    notificationSettings: {
      channels: Array<'EMAIL' | 'WHATSAPP'>
      enabledTypes: Array<
        | 'CONFIRMATION'
        | 'CANCELLATION'
        | 'NEW_APPOINTMENT'
        | 'DAILY_SUMMARY'
        | 'CONFIRMED_LIST'
        | 'PAYMENT_STATUS'
      >
      reminderBeforeMinutes: number
      dailySummaryTime: string
    }
    cancellationPolicy: {
      minHoursBeforeCancellation: number
      minDaysBeforeNextAppointment: number
      cancelationFeePercentage: number
      allowReschedule: boolean
      description: string
    }
    scheduleConfiguration: {
      bufferIntervalMinutes: number
      daysOfWeek: number[]
      startTime: string
      endTime: string
      holidays: string[]
      sessionDurationMinutes: number
    }
  }

  address: {
    addressLine1: string
    addressLine2?: string
    neighborhood: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface RegisterResponse {
  user_id: string
  role: 'CLIENT' | 'PROFESSIONAL'
  client_id?: string
  professional_id?: string
}

export interface ProfessionalNotifications {
  newAppointments: boolean
  cancellations: boolean
  confirmations: boolean
  dailySummary: boolean
  confirmedList: boolean
  notificationChannels: {
    email: boolean
    whatsapp: boolean
  }
}

export async function saveCancellationPolicy(
  professionalId: string,
  policy: CancellationPolicy
): Promise<void> {
  try {
    await api.post(`/profissional/cancellation-policy`, {
      professionalId,
      ...policy,
    })
  } catch (error) {
    console.error('Erro ao salvar política de cancelamento:', error)
    throw error
  }
}

export async function saveScheduleConfiguration(
  professionalId: string,
  config: ScheduleConfiguration
): Promise<void> {
  try {
    await api.post(`/profissional/schedule-configuration`, {
      professionalId,
      ...config,
    })
  } catch (error) {
    console.error('Erro ao salvar configuração de horários:', error)
    throw error
  }
}

export async function saveProfessionalNotifications(
  professionalId: string,
  notifications: ProfessionalNotifications
): Promise<void> {
  try {
    await api.post(`/profissional/notifications`, {
      professionalId,
      ...notifications,
    })
  } catch (error) {
    console.error('Erro ao salvar notificações do profissional:', error)
    throw error
  }
}

export function transformSignupDataToRegisterData(
  data: SignupData
): RegisterUserData {
  // Validar e corrigir birthDate
  if (!data.birthDate || data.birthDate.trim() === '') {
    throw new Error('Data de nascimento é obrigatória')
  }

  // Validar e corrigir gender
  if (!data.gender || (data.gender !== 'MALE' && data.gender !== 'FEMALE')) {
    throw new Error('Gênero deve ser MALE ou FEMALE')
  }

  const result: RegisterUserData = {
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    cpf: data.cpf,
    birthDate: data.birthDate,
    gender: data.gender,
    role: data.userType === 'professional' ? 'PROFESSIONAL' : 'CLIENT',

    clientData:
      data.userType === 'patient'
        ? {
            periodPreference: data.periodPreference.map((p) =>
              p.toUpperCase()
            ) as Array<'MORNING' | 'AFTERNOON' | 'EVENING'>,
            extraPreferences: data.extraPreferences,
          }
        : undefined,

    professionalData:
      data.userType === 'professional'
        ? {
            sessionPrice: data.sessionPrice || 0,
            notificationSettings: {
              channels: [
                ...(data.notificationChannels?.email ? ['EMAIL' as const] : []),
                ...(data.notificationChannels?.whatsapp
                  ? ['WHATSAPP' as const]
                  : []),
              ],
              enabledTypes: [
                ...(data.notifications?.newAppointments
                  ? ['NEW_APPOINTMENT' as const]
                  : []),
                ...(data.notifications?.cancellations
                  ? ['CANCELLATION' as const]
                  : []),
                ...(data.notifications?.confirmations
                  ? ['CONFIRMATION' as const]
                  : []),
                ...(data.notifications?.dailySummary
                  ? ['DAILY_SUMMARY' as const]
                  : []),
                ...(data.notifications?.confirmedList
                  ? ['CONFIRMED_LIST' as const]
                  : []),
                ...(data.notifications?.payments
                  ? ['PAYMENT_STATUS' as const]
                  : []),
              ],
              reminderBeforeMinutes: 60,
              dailySummaryTime: '08:00',
            },
            cancellationPolicy: {
              minHoursBeforeCancellation: data.minHoursBeforeCancellation || 24,
              minDaysBeforeNextAppointment:
                data.minDaysBeforeNextAppointment || 1,
              cancelationFeePercentage: data.cancelationFeePercentage || 0,
              allowReschedule:
                data.allowReschedule !== undefined
                  ? data.allowReschedule
                  : true,
              description:
                data.cancellationPolicy || 'Política padrão de cancelamento',
            },
            scheduleConfiguration: {
              bufferIntervalMinutes: data.breakTime || 15,
              daysOfWeek: [
                ...(data.workDays?.sunday ? [0] : []),
                ...(data.workDays?.monday ? [1] : []),
                ...(data.workDays?.tuesday ? [2] : []),
                ...(data.workDays?.wednesday ? [3] : []),
                ...(data.workDays?.thursday ? [4] : []),
                ...(data.workDays?.friday ? [5] : []),
                ...(data.workDays?.saturday ? [6] : []),
              ],
              startTime: data.startTime || '09:00',
              endTime: data.endTime || '18:00',
              holidays: [],
              sessionDurationMinutes: data.appointmentDuration || 60,
            },
          }
        : undefined,
    address: {
      addressLine1: data.address.street,
      addressLine2: data.address.complement || undefined,
      neighborhood: data.address.neighborhood,
      city: data.address.city,
      state: data.address.state,
      postalCode: data.address.cep,
      country: 'Brasil',
    },
  }

  return result
}

export function transformSignupDataToScheduleConfig(
  data: SignupData
): ScheduleConfiguration | null {
  if (data.userType !== 'professional' || !data.workDays) {
    return null
  }

  const daysOfWeek: number[] = []
  if (data.workDays.sunday) daysOfWeek.push(0)
  if (data.workDays.monday) daysOfWeek.push(1)
  if (data.workDays.tuesday) daysOfWeek.push(2)
  if (data.workDays.wednesday) daysOfWeek.push(3)
  if (data.workDays.thursday) daysOfWeek.push(4)
  if (data.workDays.friday) daysOfWeek.push(5)
  if (data.workDays.saturday) daysOfWeek.push(6)

  return {
    daysOfWeek,
    startTime: data.startTime || '09:00',
    endTime: data.endTime || '18:00',
    sessionDurationMinutes: data.appointmentDuration || 60,
    bufferIntervalMinutes: data.breakTime || 15,
    enableGoogleMeet: true,
    holidays: [],
  }
}

export function transformSignupDataToCancellationPolicy(
  data: SignupData
): CancellationPolicy | null {
  if (data.userType !== 'professional') {
    return null
  }

  return {
    allowReschedule:
      data.allowReschedule !== undefined ? data.allowReschedule : true,
    cancelationFeePercentage: data.cancelationFeePercentage || 0,
    minDaysBeforeNextAppointment: data.minDaysBeforeNextAppointment || 1,
    minHoursBeforeCancellation: data.minHoursBeforeCancellation || 24,
    description: data.cancellationPolicy || 'Política padrão de cancelamento',
  }
}

export function transformSignupDataToNotifications(
  data: SignupData
): ProfessionalNotifications | null {
  if (
    data.userType !== 'professional' ||
    !data.notifications ||
    !data.notificationChannels
  ) {
    return null
  }

  return {
    ...data.notifications,
    notificationChannels: data.notificationChannels,
  }
}
