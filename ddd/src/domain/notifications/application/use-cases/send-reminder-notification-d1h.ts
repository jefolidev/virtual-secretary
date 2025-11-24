import { type Either, right } from '@src/core/either'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import {
  Notification,
  type NotificationReminderType,
} from '../../enterprise/entities/notification'
import type { NotificationsRepository } from '../repositories/notification-repository'

export interface SendReminderNotificationUseCaseRequest {
  userId: string
  title: string
  content: string
  reminderType: NotificationReminderType
}

export type SendReminderNotificationUseCaseResponse = Either<
  null,
  { notification: Notification }
>

export class SendReminderNotificationUseCase {
  constructor(private notificationRepository: NotificationsRepository) {}

  async execute({
    userId,
    title,
    content,
    reminderType,
  }: SendReminderNotificationUseCaseRequest): Promise<SendReminderNotificationUseCaseResponse> {
    const reminder = Notification.create({
      recipientId: new UniqueEntityId(userId),
      title,
      content,
      reminderType,
    })

    await this.notificationRepository.create(reminder)

    return right({ notification: reminder })
  }
}
