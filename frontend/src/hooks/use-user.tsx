import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { userServices } from '../api/endpoints/users'
import {
  useAuth,
  type ProfessionalNotificationSettings,
  type ProfessionalSettings,
} from '../contexts/auth-context'
import type {
  DayOfWeek,
  UpdateCancellationPolicyData,
  UpdateProfessional,
  UpdateProfessionalWorkDaysData,
  UpdateProfessionalWorkHoursData,
  UpdateScheduleConfigurationData,
  UpdateUserAccountData,
} from '../types/user'

interface UserContextType {
  // State
  notificationSettings: ProfessionalNotificationSettings | null
  professionalSettings: ProfessionalSettings | null
  loading: boolean
  error: string | null

  // Actions
  fetchProfessionalNotificationSettings: () => Promise<void>
  fetchProfessionalSettings: () => Promise<void>
  updateAccount: (data: UpdateUserAccountData) => Promise<void>
  updateProfessional: (data: UpdateProfessional) => Promise<void>
  updateScheduleConfiguration: (
    data: UpdateScheduleConfigurationData
  ) => Promise<void>
  updateCancellationPolicy: (
    data: UpdateCancellationPolicyData
  ) => Promise<void>

  updateProfessionalWorkHours: (
    data: UpdateProfessionalWorkHoursData
  ) => Promise<void>
  updateProfessionalWorkDays: (
    data: UpdateProfessionalWorkDaysData
  ) => Promise<void>

  // uploadProfileImage: (file: File) => Promise<string>
  // deleteProfileImage: () => Promise<void>
  clearError: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { user: authUser, checkAuth } = useAuth() // Reuse auth user data

  const [professionalSettings, setProfessionalSettings] =
    useState<ProfessionalSettings | null>(null)

  const [notificationSettings, setNotificationSettings] =
    useState<ProfessionalNotificationSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const fetchProfessionalNotificationSettings = async () => {
    try {
      setError(null)
      if (!authUser?.professional_id) {
        setError('Usuário não é um profissional válido')
        throw new Error('Professional id not valid.')
      }

      const settingsData =
        await userServices.getProfessionalNotificationSettings(
          authUser?.professional_id
        )
      setNotificationSettings(settingsData)
    } catch (err) {
      setError('Erro ao carregar configurações do usuário')
      console.error('Erro ao buscar configurações:', err)
    }
  }

  const fetchProfessionalSettings = async () => {
    try {
      setError(null)
      if (!authUser?.professional_id) {
        setError('Usuário não é um profissional válido')
        throw new Error('Professional id not valid.')
      }

      const settingsData = await userServices.getProfessionalSettings()
      setProfessionalSettings(settingsData)
    } catch (err) {
      setError('Erro ao carregar configurações do profissional')
      console.error('Erro ao buscar configurações do profissional:', err)
    }
  }

  const updateAccount = async (data: UpdateUserAccountData) => {
    try {
      setLoading(true)
      setError(null)
      await userServices.updateUserAccount(data)
      // Refresh auth user data after account update
      await checkAuth()
    } catch (err) {
      setError('Erro ao atualizar dados da conta')
      console.error('Erro ao atualizar conta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfessional = async (data: UpdateProfessional) => {
    try {
      setError(null)
      const updatedSettings = await userServices.updateProfessional(data)
      setNotificationSettings((prev) =>
        prev ? { ...prev, ...updatedSettings } : updatedSettings
      )
    } catch (err) {
      setError('Erro ao atualizar configurações de notificação')
      console.error('Erro ao atualizar notificações:', err)
      throw err
    }
  }

  const updateCancellationPolicy = async (
    data: UpdateCancellationPolicyData
  ) => {
    try {
      setError(null)
      await userServices.updateCancellationPolicy(data)
      // Refetch settings to get updated data
      await fetchProfessionalSettings()
    } catch (err) {
      setError('Erro ao atualizar política de cancelamento')
      console.error('Erro ao atualizar política de cancelamento:', err)
      throw err
    }
  }

  const updateScheduleConfiguration = async (
    data: UpdateScheduleConfigurationData
  ) => {
    try {
      setError(null)
      await userServices.updateScheduleConfiguration(data)

      await fetchProfessionalSettings()
    } catch (err) {
      setError('Erro ao atualizar configuração de agendamento')
      console.error('Erro ao atualizar configuração de agendamento:', err)
      throw err
    }
  }

  const updateProfessionalWorkHours = async ({
    newStartHour,
    newEndHour,
  }: UpdateProfessionalWorkHoursData) => {
    try {
      setError(null)
      await userServices.updateProfessionalWorkHours(newStartHour, newEndHour)

      await fetchProfessionalSettings()
    } catch (err) {
      setError('Erro ao atualizar horários de trabalho')
      console.error('Erro ao atualizar horários de trabalho:', err)
      throw err
    }
  }

  const updateProfessionalWorkDays = async (
    data: UpdateProfessionalWorkDaysData
  ) => {
    try {
      setError(null)
      const result = await userServices.updateProfessionalWorkDays(
        data.newDays as DayOfWeek[]
      )

      await fetchProfessionalSettings()

      return result
    } catch (err) {
      setError('Erro ao atualizar horários de trabalho')
      console.error('Erro ao atualizar horários de trabalho:', err)
      throw err
    }
  }

  // const uploadProfileImage = async (file: File): Promise<string> => {
  //   try {
  //     setError(null)
  //     const { imageUrl } = await userServices.uploadProfileImage(file)

  //     // Refresh auth user data after image upload
  //     await checkAuth()

  //     return imageUrl
  //   } catch (err) {
  //     setError('Erro ao fazer upload da imagem')
  //     console.error('Erro ao fazer upload:', err)
  //     throw err
  //   }
  // }

  // const deleteProfileImage = async () => {
  //   try {
  //     setError(null)
  //     await userServices.deleteProfileImage()

  //     // Refresh auth user data after image deletion
  //     await checkAuth()
  //   } catch (err) {
  //     setError('Erro ao remover imagem do perfil')
  //     console.error('Erro ao deletar imagem:', err)
  //     throw err
  //   }
  // }

  // Auto-fetch notificationSettings when user is authenticated
  useEffect(() => {
    if (authUser) {
      fetchProfessionalNotificationSettings()
    } else {
      setNotificationSettings(null)
    }
  }, [authUser])

  // Auto-fetch professionalSettings when user is authenticated
  useEffect(() => {
    if (authUser?.professional_id) {
      fetchProfessionalSettings()
    } else {
      setProfessionalSettings(null)
    }
  }, [authUser])

  const contextValue: UserContextType = {
    // State
    notificationSettings,
    loading,
    error,
    professionalSettings,

    // Actions
    fetchProfessionalNotificationSettings,
    updateAccount,
    updateProfessional,
    updateCancellationPolicy,
    updateScheduleConfiguration,
    fetchProfessionalSettings,
    updateProfessionalWorkHours,
    updateProfessionalWorkDays,
    // uploadProfileImage,
    // deleteProfileImage,
    clearError,
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
