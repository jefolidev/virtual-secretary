import type { Appointment } from '@/api/schemas/fetch-professional-schedules.dto'

export type PeriodPreferenceType = 'MORNING' | 'AFTERNOON' | 'EVENING'

export interface Address {
  _id: { value: string }
  props: {
    addressLine1: string
    addressLine2: string
    city: string
    country: string
    neighborhood: string
    postalCode: string
    state: string
    organizationId: string | null
    createdAt: string
  }
}

export interface Notification {
  reminderType: string
  createdAt: string
  readAt: string | null
}

export interface FetchProfessionalSchedulesResponse {
  appointment: Appointment
  client: {
    extraPreference: string | null
    periodPreference: PeriodPreferenceType[]
  }
  address: Address
  notification: Notification[]
  name: string
  whatsappNumber: string
  email: string
  cpf: string
  gender: 'MALE' | 'FEMALE'
}

export interface FetchProfessionalSchedulesListResponse {
  appointments: FetchProfessionalSchedulesResponse[]
  pages: number
}
  