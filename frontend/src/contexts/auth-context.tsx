import { api } from '@/api/axios'
import { authServices, type UserLoginData } from '@/api/endpoints/auth'
import {
  transformSignupDataToRegisterData,
  type RegisterResponse,
} from '@/services/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export interface User {
  id: string
  name: string
  email: string
  userType: 'professional' | 'patient'
  phone?: string
  cpf?: string
  birthdate?: string
  address?: {
    cep: string
    street: string
    neighborhood: string
    city: string
    state: string
    number?: string
    complement?: string
  }
}

export interface SignupData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  cpf: string
  birthdate: string
  userType: 'professional' | 'patient'

  periodPreference: Array<'morning' | 'afternoon' | 'evening'>
  extraPreferences: string

  sessionPrice?: number
  cancellationPolicy?: string
  minHoursBeforeCancellation?: number
  minDaysBeforeNextAppointment?: number
  cancelationFeePercentage?: number
  allowReschedule?: boolean
  appointmentDuration?: number
  breakTime?: number
  startTime?: string
  endTime?: string
  workDays?: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  notifications?: {
    newAppointments: boolean
    cancellations: boolean
    confirmations: boolean
    dailySummary: boolean
    confirmedList: boolean
    payments: boolean
  }
  notificationChannels?: {
    email: boolean
    whatsapp: boolean
  }

  address: {
    cep: string
    street: string
    neighborhood: string
    city: string
    state: string
    number?: string
    complement?: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

interface AuthContextType {
  user: UserLoginData | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<RegisterResponse>
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserLoginData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    try {
      const userData = await authServices.me()
      setUser(userData)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (credentials: LoginCredentials) => {
    try {
      await authServices.login(credentials)

      await checkAuth()
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const signup = async (data: SignupData) => {
    try {
      if (data.userType === 'professional') {
        const requiredFields = {
          sessionPrice: data.sessionPrice,
          workDays:
            data.workDays && Object.values(data.workDays).some((day) => day),
          appointmentDuration: data.appointmentDuration,
          startTime: data.startTime,
          endTime: data.endTime,
          notifications: data.notifications,
          notificationChannels: data.notificationChannels,
        }

        const missingFields = Object.entries(requiredFields)
          .filter(
            ([_, value]) => !value || (typeof value === 'number' && value <= 0)
          )
          .map(([key]) => key)

        if (missingFields.length > 0) {
          throw new Error(
            `Dados obrigatórios do profissional estão faltando: ${missingFields.join(
              ', '
            )}`
          )
        }
      }

      const registerData = transformSignupDataToRegisterData(data)
      return await authServices.signUp(registerData)
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
