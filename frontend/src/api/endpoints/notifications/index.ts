import { api } from '@/api/axios'
import type { Notification } from './dto'

export const notificationServices = {
  fetchNotifications: async (params?: {
    unreadOnly?: boolean
    limit?: number
  }): Promise<Notification[]> => {
    const response = await api.get('/me/notifications', { params })
    return response.data.notifications
  },

  readNotification: async (notificationId: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  },
}
