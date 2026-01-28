import { api } from '@/api/axios'

export const professionalServices = {
  getProfessionalSchedules: async (professionalId: string) => {
    try {
      const response = await api.get(
        `/professionals/${professionalId}/schedules`,
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar horários do profissional:', error)
      throw error
    }
  },
}
