import { authToken } from '@/auth/auth-token'
import type { RegisterResponse, RegisterUserData } from '@/services/auth'
import { api } from '../axios'
import type { LoginBodySchema } from '../schemas/login-schema'
import { type GoogleAuthSuccessResponse } from './../schemas/google-auth'

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
  loginWithGoogle: () => Promise<GoogleAuthSuccessResponse>
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

  /**
   * Inicia o fluxo de autenticação com Google
   * Abre uma popup para login
   */
  loginWithGoogle(): Promise<GoogleAuthSuccessResponse> {
    const API_BASE_URL =
      import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3333'
    return new Promise((resolve, reject) => {
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      // Abre a rota que INICIA o fluxo OAuth do Google
      const popup = window.open(
        `${API_BASE_URL}/webhooks/google/auth/google`,
        'Google Login',
        `width=${width},height=${height},left=${left},top=${top}`,
      )

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'))
        return
      }

      // Listener para mensagens da popup
      const messageListener = (event: MessageEvent) => {
        // Verificar origem por segurança
        if (event.origin !== window.location.origin) {
          return
        }

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          console.log('✅ Google Auth Success!')
          window.removeEventListener('message', messageListener)
          popup.close()
          resolve(event.data.data)
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          console.log('❌ Google Auth Error!')
          window.removeEventListener('message', messageListener)
          popup.close()
          reject(new Error(event.data.error))
        }
      }

      window.addEventListener('message', messageListener)

      // Verificar se popup foi fechada manualmente
      const popupCheckInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheckInterval)
          window.removeEventListener('message', messageListener)
          reject(new Error('Login cancelled by user'))
        }
      }, 500)
    })
  },

  login: async ({
    email,
    password,
  }: LoginBodySchema): Promise<{ access_token: string }> => {
    try {
      const response = await api.post('/login', { email, password })

      const { access_token } = response.data

      authToken.set(access_token)

      return access_token
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
