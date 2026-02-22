import { api } from '../axios'

export const appointmentsServices = {
  fetchAppointmentsByProfessional: async (
    professionalId: string,
    page: number = 1,
  ) => {
    try {
      const response = await api.get(
        `/professional/${professionalId}/appointments?page=${page}`,
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar agendamentos do profissional:', error)
      throw error
    }
  },
}
