import type { RegisterResponse, RegisterUserData } from '@/services/auth'
import { api } from '../axios'
import type { LoginBodySchema } from '../schemas/login-schema'

export interface UserLoginData {
  userId: string
  name: string
  email: string
  cpf: string
  birthDate: Date
  gender: 'MALE' | 'FEMALE'
  whatsappNumber: string
  role: string
  professional_id: string | null
  client_id: string | null
  created_at: Date
  updated_at: Date
}

interface AuthServicesEndPoints {
  signUp: (data: RegisterUserData) => Promise<RegisterResponse>
  login: (credentials: LoginBodySchema) => Promise<{ access_token: string }>
  me: () => Promise<UserLoginData>
}

export const authServices: AuthServicesEndPoints = {
  signUp: async (data: RegisterUserData): Promise<RegisterResponse> => {
    try {
      const response = await api.post('/register', data)
      return response.data
    } catch (error) {
      console.error('Erro ao registrar usuário:', error)
      throw error
    }
  },

  login: async ({
    email,
    password,
  }: LoginBodySchema): Promise<{ access_token: string }> => {
    try {
      const response = await api.post('/login', { email, password })

      return response.data
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  },

  me: async (): Promise<UserLoginData> => {
    try {
      const response = await api.get(`/me`)

      return response.data
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      throw error
    }
  },
}
