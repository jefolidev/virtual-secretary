import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { userServices } from '../api/endpoints/users'
import { useAuth } from '../contexts/auth-context'
import type {
  UpdateUserAccountData,
  UpdateUserConsultationsData,
  UpdateUserNotificationsData,
  UserSettings,
} from '../types/user'

interface UserContextType {
  // State
  settings: UserSettings | null
  loading: boolean
  error: string | null

  // Actions
  fetchUserSettings: () => Promise<void>
  updateAccount: (data: UpdateUserAccountData) => Promise<void>
  updateNotifications: (data: UpdateUserNotificationsData) => Promise<void>
  updateConsultations: (data: UpdateUserConsultationsData) => Promise<void>
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
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const fetchUserSettings = async () => {
    try {
      setError(null)
      const settingsData = await userServices.getUserSettings()
      setSettings(settingsData)
    } catch (err) {
      setError('Erro ao carregar configurações do usuário')
      console.error('Erro ao buscar configurações:', err)
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

  const updateNotifications = async (data: UpdateUserNotificationsData) => {
    try {
      setError(null)
      const updatedSettings = await userServices.updateUserNotifications(data)
      setSettings((prev) =>
        prev ? { ...prev, ...updatedSettings } : updatedSettings
      )
    } catch (err) {
      setError('Erro ao atualizar configurações de notificação')
      console.error('Erro ao atualizar notificações:', err)
      throw err
    }
  }

  const updateConsultations = async (data: UpdateUserConsultationsData) => {
    try {
      setError(null)
      const updatedSettings = await userServices.updateUserConsultations(data)
      setSettings((prev) =>
        prev ? { ...prev, ...updatedSettings } : updatedSettings
      )
    } catch (err) {
      setError('Erro ao atualizar configurações de consulta')
      console.error('Erro ao atualizar consultas:', err)
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

  // Auto-fetch settings when user is authenticated
  useEffect(() => {
    if (authUser) {
      fetchUserSettings()
    } else {
      setSettings(null)
    }
  }, [authUser])

  const contextValue: UserContextType = {
    // State
    settings,
    loading,
    error,

    // Actions
    fetchUserSettings,
    updateAccount,
    updateNotifications,
    updateConsultations,
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
