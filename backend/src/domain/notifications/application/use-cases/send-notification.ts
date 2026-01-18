import { Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotificationType } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import { Notification } from '../../enterprise/entities/notification'
import type { NotificationsRepository } from '../repositories/notification-repository'

export interface SendNotificationUseCaseRequest {
  recipientId: string
  title: string
  content: string
  reminderType: NotificationType
}
export type SendNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification
  }
>

export class SendNotificationUseCase {
  constructor(private notificationRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    title,
    content,
    reminderType,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const notification = Notification.create({
      recipientId: new UniqueEntityId(recipientId),
      title,
      content,
      reminderType,
    })

    await this.notificationRepository.create(notification)

    return right({
      notification,
    })
  }
}
