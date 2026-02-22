import { api } from '../axios'

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
  fetchAppointmentsByProfessional: async (
    professionalId: string,
    page: number = 1,
    filter: FetchScheduleByProfessionalIdFilters,
  ) => {
    try {
      const response = await api.get(
        `/professional/${professionalId}/appointments?page=${page}&period=${filter.period}&status=${filter.status}&paymentStatus=${filter.paymentStatus}&modality=${filter.modality}`,
      )

      return response
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
}
