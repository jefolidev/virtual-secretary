import type { NotificationsRepository } from '@src/domain/notifications/application/repositories/notification-repository'
import type { Notification } from '@src/domain/notifications/enterprise/entities/notification'

export class InMemorySendNotificationRepository
  implements NotificationsRepository
{
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
      (item) => item.id === notification.id
    )

    this.items[itemIndex] = notification
  }
}
