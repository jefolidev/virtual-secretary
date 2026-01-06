import { createContext, useContext, useState } from 'react'

export interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  cpf: string
  birthdate: string

  userType: 'professional' | 'patient' | null

  periodPreference: Array<'morning' | 'afternoon' | 'evening'>
  extraPreferences: string

  workDays: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }

  sessionPrice: number
  appointmentDuration: number
  breakTime: number
  startTime: string
  endTime: string

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

  cancellationPolicy: string
  allowReschedule: boolean
  cancelationFeePercentage: number
  minHoursBeforeCancellation: number
  minDaysBeforeNextAppointment: number

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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  cpf: '',
  birthdate: '',

  userType: null,

  periodPreference: [],
  extraPreferences: '',

  workDays: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },

  sessionPrice: 0,
  appointmentDuration: 60,
  breakTime: 15,
  startTime: '09:00',
  endTime: '18:00',

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

  cancellationPolicy: '',
  allowReschedule: true,
  cancelationFeePercentage: 0,
  minHoursBeforeCancellation: 24,
  minDaysBeforeNextAppointment: 1,

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
  const [formData, setFormData] = useState<FormData>(initialFormData)

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
