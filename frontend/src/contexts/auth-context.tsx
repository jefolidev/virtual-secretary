import {
  registerUser,
  transformSignupDataToRegisterData,
} from '@/services/auth'
import { createContext, useContext, useEffect, useState } from 'react'

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
  // Dados do paciente
  periodPreference: Array<'morning' | 'afternoon' | 'evening'>
  extraPreferences: string
  // Dados do profissional
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
  // Endereço
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
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Verifica autenticação ao carregar a aplicação
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      // Verifica se há token no localStorage
      const token = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('user_data')

      if (token && savedUser) {
        // TODO: Validar token com backend
        // const response = await fetch('/api/auth/verify', {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        // if (response.ok) {
        //   const userData = await response.json()
        //   setUser(userData)
        // } else {
        //   localStorage.removeItem('auth_token')
        //   localStorage.removeItem('user_data')
        // }

        // Por enquanto, apenas carrega do localStorage
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      // TODO: Integrar com backend
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // })
      // if (!response.ok) throw new Error('Credenciais inválidas')
      // const { token, user } = await response.json()

      // Simulação temporária
      const mockUser: User = {
        id: '1',
        name: 'Usuário Teste',
        email: credentials.email,
        userType: 'patient',
      }

      const mockToken = 'mock_jwt_token_' + Date.now()

      // Salva no localStorage
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('user_data', JSON.stringify(mockUser))

      setUser(mockUser)
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const signup = async (data: SignupData) => {
    try {
      console.log('🎯 Iniciando processo de cadastro...')

      // 1. Validação prévia para profissionais
      if (data.userType === 'professional') {
        // Validar se todos os dados obrigatórios do profissional estão presentes
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

      console.log('📝 Registrando usuário...')
      const registerData = transformSignupDataToRegisterData(data)
      const response = await registerUser(registerData)
      console.log('✅ Usuário registrado com sucesso!')

      // Nota: Para profissionais, todos os dados são enviados na estrutura professionalData
      // em uma única requisição, garantindo consistência transacional

      // 3. Cria o usuário e salva no estado
      const newUser: User = {
        id: response.id,
        name: response.name,
        email: response.email,
        userType: response.userType,
        phone: data.phone,
        cpf: data.cpf,
        birthdate: data.birthdate,
        address: data.address,
      }

      // Salva token e dados do usuário
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user_data', JSON.stringify(newUser))

      setUser(newUser)
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  const logout = () => {
    // TODO: Invalidar token no backend
    // fetch('/api/auth/logout', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}` }
    // })

    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
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
