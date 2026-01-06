import { createContext, useContext, useEffect, useState } from 'react'

export interface FormData {
  // Dados da conta
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  cpf: string
  birthdate: string

  // Tipo de usuário
  userType: 'professional' | 'patient' | null

  // Dados do paciente
  periodPreference: Array<'morning' | 'afternoon' | 'evening'>
  extraPreferences: string // Campo de texto para preferências extras

  // Dados do profissional - dias de trabalho
  workDays: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }

  // Dados do profissional - configurações
  sessionPrice: number
  appointmentDuration: number
  breakTime: number
  startTime: string
  endTime: string

  // Dados do profissional - notificações
  notifications: {
    newAppointments: boolean
    cancellations: boolean
    confirmations: boolean
    dailySummary: boolean
    confirmedList: boolean
    payments: boolean
  }
  notificationChannels: {
    email: boolean
    whatsapp: boolean
  }

  // Dados do profissional - política de cancelamento
  cancellationPolicy: string
  allowReschedule: boolean
  cancelationFeePercentage: number
  minHoursBeforeCancellation: number
  minDaysBeforeNextAppointment: number

  // Endereço
  address: {
    cep: string
    street: string
    neighborhood: string
    city: string
    state: string
    number: string
    complement: string
  }
}

interface SignupFormContextType {
  formData: FormData
  updateFormData: (field: keyof FormData, value: any) => void
  updateNestedFormData: (
    field: keyof FormData,
    nestedField: string,
    value: any
  ) => void
  clearFormData: () => void
}

const SignupFormContext = createContext<SignupFormContextType | undefined>(
  undefined
)

const initialFormData: FormData = {
  // Dados da conta
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  cpf: '',
  birthdate: '',

  // Tipo de usuário
  userType: null,

  // Dados do paciente
  periodPreference: [],
  extraPreferences: '',

  // Dados do profissional - dias de trabalho
  workDays: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },

  // Dados do profissional - configurações
  sessionPrice: 0,
  appointmentDuration: 60,
  breakTime: 15,
  startTime: '09:00',
  endTime: '18:00',

  // Dados do profissional - notificações
  notifications: {
    newAppointments: false,
    cancellations: false,
    confirmations: false,
    dailySummary: false,
    confirmedList: false,
    payments: false,
  },
  notificationChannels: {
    email: false,
    whatsapp: false,
  },

  // Dados do profissional - política de cancelamento
  cancellationPolicy: '',
  allowReschedule: true,
  cancelationFeePercentage: 0,
  minHoursBeforeCancellation: 24,
  minDaysBeforeNextAppointment: 1,

  // Endereço
  address: {
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    number: '',
    complement: '',
  },
}

export function SignupFormProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Tentar carregar dados do localStorage primeiro
  const getInitialFormData = (): FormData => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('signupFormData')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return initialFormData
        }
      }
    }
    return initialFormData
  }

  const [formData, setFormData] = useState<FormData>(getInitialFormData)

  // Salvar no localStorage sempre que o formData mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('signupFormData', JSON.stringify(formData))
    }
  }, [formData])

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateNestedFormData = (
    field: keyof FormData,
    nestedField: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as object),
        [nestedField]: value,
      },
    }))
  }

  const clearFormData = () => {
    setFormData(initialFormData)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('signupFormData')
    }
  }

  return (
    <SignupFormContext.Provider
      value={{ formData, updateFormData, updateNestedFormData, clearFormData }}
    >
      {children}
    </SignupFormContext.Provider>
  )
}

export function useSignupForm() {
  const context = useContext(SignupFormContext)
  if (context === undefined) {
    throw new Error(
      'useSignupForm deve ser usado dentro de um SignupFormProvider'
    )
  }
  return context
}
