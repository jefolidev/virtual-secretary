import { Notification } from '../../enterprise/entities/notification';

export abstract class NotificationsRepository {
  abstract create(notification: Notification): Promise<void>
  abstract findById(id: string): Promise<Notification | null>
  abstract save(notification: Notification): Promise<void>
  abstract findManyByRecipientId(
    recipientId: string,
    params?: { unreadOnly?: boolean; limit?: number },
  ): Promise<Notification[]>
}
