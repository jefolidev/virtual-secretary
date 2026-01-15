import type {
  ProfessionalNotificationSettings,
  ProfessionalSettings,
} from '@/contexts/auth-context'
import type {
  UpdateCancellationPolicyData,
  UpdateScheduleConfigurationData,
  UpdateUserAccountData,
  UpdateUserNotificationsData,
  User,
} from '../../types/user'
import { api } from '../axios'

export const userServices = {
  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error)
      throw error
    }
  },

  getProfessionalSettings: async (): Promise<ProfessionalSettings> => {
    try {
      const response = await api.get('/professional/settings')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar configurações do profissional:', error)
      throw error
    }
  },

  // Update current user profile
  updateUserAccount: async (data: UpdateUserAccountData): Promise<User> => {
    try {
      const response = await api.patch('/me/profile', data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar conta do usuário:', error)
      throw error
    }
  },

  // Update user notifications settings
  updateUserNotifications: async (
    data: UpdateUserNotificationsData
  ): Promise<ProfessionalNotificationSettings> => {
    try {
      const response = await api.put('/me/professional', data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar notificações do usuário:', error)
      throw error
    }
  },

  // Update user consultations settings
  updateScheduleConfiguration: async (
    data: UpdateScheduleConfigurationData
  ): Promise<void> => {
    try {
      const response = await api.put('/me/schedule-configuration', data)

      console.log('[Data sent to updateScheduleConfiguration]', data)
      console.log('[Response from updateScheduleConfiguration]', response.data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar configurações de consultas:', error)
      throw error
    }
  },

  updateCancellationPolicy: async (
    data: UpdateCancellationPolicyData
  ): Promise<void> => {
    try {
      const response = await api.put('/me/cancellation-policy', data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar configurações de consultas:', error)
      throw error
    }
  },

  // Get user settings
  getProfessionalNotificationSettings: async (
    professionalId: string
  ): Promise<ProfessionalNotificationSettings> => {
    try {
      const response = await api.get(
        `professional/${professionalId}/notification-settings`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar configurações do usuário:', error)
      throw error
    }
  },

  // // Upload profile image
  // uploadProfileImage: async (file: File): Promise<{ imageUrl: string }> => {
  //   try {
  //     const formData = new FormData()
  //     formData.append('image', file)

  //     const response = await api.post('/me/profile-image', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     })
  //     return response.data
  //   } catch (error) {
  //     console.error('Erro ao fazer upload da imagem:', error)
  //     throw error
  //   }
  // },

  // Delete profile image
  // deleteProfileImage: async (): Promise<void> => {
  //   try {
  //     await api.delete('/me/profile-image')
  //   } catch (error) {
  //     console.error('Erro ao deletar imagem do perfil:', error)
  //     throw error
  //   }
  // },
}
