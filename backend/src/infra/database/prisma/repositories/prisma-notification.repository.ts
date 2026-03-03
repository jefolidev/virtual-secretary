import { NotificationsRepository } from '@/domain/notifications/application/repositories/notification.repository'
import { Notification } from '@/domain/notifications/enterprise/entities/notification'

import { Injectable } from '@nestjs/common'

import { PrismaNotificationMapper } from '../../mappers/prisma-notification-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id,
      },
    })

    if (!notification) {
      return null
    }

    return PrismaNotificationMapper.toDomain(notification)
  }

  async create(notification: Notification): Promise<void> {
    const data = PrismaNotificationMapper.toPrisma(notification)

    await this.prisma.notification.create({
      data,
    })
  }

  async save(notification: Notification): Promise<void> {
    const data = PrismaNotificationMapper.toPrisma(notification)

    await this.prisma.notification.update({
      where: {
        id: notification.id.toString(),
      },
      data,
    })
  }

  async findManyByRecipientId(
    recipientId: string,
    params?: { unreadOnly?: boolean; limit?: number },
  ): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        recipientId,
        ...(params?.unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { sentAt: 'desc' },
      take: params?.limit ?? 50,
    })

    return notifications.map(PrismaNotificationMapper.toDomain)
  }
}
