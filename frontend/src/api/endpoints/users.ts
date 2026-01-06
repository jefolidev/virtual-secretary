import { api } from "../axios"

export const userServices = {
  getUserById: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error)
      throw error
    }
  }
}