import { api } from '../axios'
import type { FetchProfessionalSchedulesListResponse } from './appointments/dto'

export interface EvaluationStatsResponse {
  stats: {
    averageScore: number
    total: number
    distribution: Record<string, number>
    percentages?: Record<string, number>
    median?: number | null
    mode?: number | null
    detractors?: number
    passives?: number
    promoters?: number
    nps?: number
  }
}

export type FetchScheduleByProfesionalIdStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'AWAITING_SCORE'
  | 'AWAITING_COMMENT'
  | 'all'

export type FetchScheduleByProfessionalIdPaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'all'

export type FetchScheduleByProfessionalIdPeriod =
  | 'last-year'
  | 'last-month'
  | 'last-week'
  | 'all'
export type FetchScheduleByProfessionalIdModality =
  | 'IN_PERSON'
  | 'ONLINE'
  | 'all'

export type FetchScheduleByProfessionalIdFilters = {
  period: FetchScheduleByProfessionalIdPeriod
  status: FetchScheduleByProfesionalIdStatus
  paymentStatus: FetchScheduleByProfessionalIdPaymentStatus
  modality: FetchScheduleByProfessionalIdModality
}

export const appointmentsServices = {
  createAppointment: async (data: {
    professionalId: string
    clientId: string
    modality: 'IN_PERSON' | 'ONLINE'
    startDateTime: Date
    syncWithGoogleCalendar: boolean
  }) => {
    try {
      const response = await api.post('/appointments/schedule', data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      throw error
    }
  },

  fetchAppointmentsByProfessional: async (
    professionalId: string,
    page?: number,
    filter?: FetchScheduleByProfessionalIdFilters,
  ): Promise<FetchProfessionalSchedulesListResponse> => {
    try {
      const response = await api.get(
        `/professional/${professionalId}/appointments?page=${page || 1}&period=${filter?.period || 'all'}&status=${filter?.status || 'all'}&paymentStatus=${filter?.paymentStatus || 'all'}&modality=${filter?.modality || 'all'}`,
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar agendamentos do profissional:', error)
      throw error
    }
  },

  startAppointment: async (appointmentId: string) => {
    try {
      const response = await api.post(`/sessions/${appointmentId}/start`)
      return response
    } catch (error) {
      console.error('Erro ao iniciar o agendamento:', error)
      throw error
    }
  },

  pauseAppointment: async (appointmentId: string) => {
    try {
      const response = await api.post(`/sessions/${appointmentId}/pause`)
      return response
    } catch (error) {
      console.error('Erro ao pausar o agendamento:', error)
      throw error
    }
  },

  endAppointment: async (appointmentId: string) => {
    try {
      const response = await api.post(`/sessions/${appointmentId}/stop`)
      return response
    } catch (error) {
      console.error('Erro ao finalizar o agendamento:', error)
      throw error
    }
  },

  getEvaluationStats: async (
    professionalId: string,
    params?: { from?: string; to?: string; minScore?: number },
  ): Promise<EvaluationStatsResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    if (params?.minScore !== undefined)
      searchParams.set('minScore', String(params.minScore))

    const query = searchParams.toString()
    const response = await api.get(
      `/professionals/${professionalId}/evaluations/stats${query ? `?${query}` : ''}`,
    )
    return response.data
  },
}
