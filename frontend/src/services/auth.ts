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
  birthdate: string
  role: 'CLIENT' | 'PROFESSIONAL' // Backend espera CLIENT/PROFESSIONAL
  // Dados do paciente
  periodPreference?: Array<'morning' | 'afternoon' | 'evening'>
  extraPreferences?: string
  // Endereço com nomes corretos para o backend
  address: {
    postalCode: string // Backend espera postalCode ao invés de cep
    addressLine1: string // Backend espera addressLine1 ao invés de street
    neighborhood: string
    city: string
    state: string
    number?: string
    complement?: string
  }
}

export interface RegisterResponse {
  id: string
  name: string
  email: string
  userType: 'professional' | 'patient'
  token: string
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

// Registra o usuário (cliente ou profissional)
export async function registerUser(
  userData: RegisterUserData
): Promise<RegisterResponse> {
  try {
    const response = await api.post('/register', userData)
    return response.data
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    throw error
  }
}

// Configura política de cancelamento (apenas profissionais)
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

// Configura horários de trabalho (apenas profissionais)
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

// Configura notificações (apenas profissionais)
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

// Função auxiliar para transformar dados do signup em formato para API
export function transformSignupDataToRegisterData(
  data: SignupData
): RegisterUserData {
  return {
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    cpf: data.cpf,
    birthdate: data.birthdate,
    role: data.userType === 'professional' ? 'PROFESSIONAL' : 'CLIENT', // Mapeia corretamente
    periodPreference: data.periodPreference,
    extraPreferences: data.extraPreferences,
    address: {
      postalCode: data.address.cep, // Mapeia cep para postalCode
      addressLine1: data.address.street, // Mapeia street para addressLine1
      neighborhood: data.address.neighborhood,
      city: data.address.city,
      state: data.address.state,
      number: data.address.number,
      complement: data.address.complement,
    },
  }
}

// Função auxiliar para transformar dados do signup em configuração de horários
export function transformSignupDataToScheduleConfig(
  data: SignupData
): ScheduleConfiguration | null {
  if (data.userType !== 'professional' || !data.workDays) {
    return null
  }

  // Converte os dias da semana para números (0 = domingo, 1 = segunda, etc.)
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

// Função auxiliar para transformar dados do signup em política de cancelamento
export function transformSignupDataToCancellationPolicy(
  data: SignupData
): CancellationPolicy | null {
  if (data.userType !== 'professional') {
    return null
  }

  return {
    allowReschedule: true,
    cancelationFeePercentage: 0,
    minDaysBeforeNextAppointment: 0,
    minHoursBeforeCancellation: 24,
    description: data.cancellationPolicy || 'Política padrão de cancelamento',
  }
}

// Função auxiliar para transformar dados do signup em notificações
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
