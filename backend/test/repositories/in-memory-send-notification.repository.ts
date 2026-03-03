import type { NotificationsRepository } from '@/domain/notifications/application/repositories/notification.repository'
import type { Notification } from '@/domain/notifications/enterprise/entities/notification'

export class InMemorySendNotificationRepository implements NotificationsRepository {
  public items: Notification[] = []

  async create(notification: Notification) {
    this.items.push(notification)
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = this.items.find((item) => item.id.toString() === id)

    if (!notification) return null

    return notification
  }

  async save(notification: Notification): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === notification.id,
    )

    this.items[itemIndex] = notification
  }

  async findManyByRecipientId(
    recipientId: string,
    params?: { unreadOnly?: boolean; limit?: number },
  ): Promise<Notification[]> {
    let notifications = this.items.filter(
      (item) => item.recipientId.toString() === recipientId,
    )

    if (params?.unreadOnly) {
      notifications = notifications.filter((item) => !item.readAt)
    }

    return notifications.slice(0, params?.limit ?? 50)
  }
}
