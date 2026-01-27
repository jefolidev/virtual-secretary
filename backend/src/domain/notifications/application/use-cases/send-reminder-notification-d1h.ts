import { Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotificationType } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import { Notification } from '../../enterprise/entities/notification'
import type { NotificationsRepository } from '../repositories/notification.repository'

export interface SendReminderNotificationUseCaseRequest {
  userId: string
  title: string
  content: string
  reminderType: NotificationType
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
      reminderType: reminderType,
    })

    await this.notificationRepository.create(reminder)

    return right({ notification: reminder })
  }
}
