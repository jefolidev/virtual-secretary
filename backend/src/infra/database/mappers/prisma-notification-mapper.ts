import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Notification } from '@/domain/notifications/enterprise/entities/notification'
import {
  Prisma,
  Notification as PrismaNotification,
} from '@prisma/generated/client'

export class PrismaNotificationMapper {
  static toDomain(raw: PrismaNotification): Notification {
    return Notification.create(
      {
        title: raw.title,
        content: raw.content,
        recipientId: new UniqueEntityId(raw.recipientId),
        reminderType: raw.type,
        createdAt: raw.sentAt,
        readAt: raw.readAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    notification: Notification,
  ): Prisma.NotificationUncheckedCreateInput {
    return {
      id: notification.id.toString(),
      recipientId: notification.recipientId.toString(),
      title: notification.title,
      content: notification.content,
      readAt: notification.readAt,
      sentAt: notification.createdAt,
      type: notification.reminderType,
    }
  }
}
