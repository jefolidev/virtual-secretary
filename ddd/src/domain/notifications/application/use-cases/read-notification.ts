import { type Either, left, right } from '@src/core/either'
import { NotAllowedError } from '@src/core/errors/not-allowed-error'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import type { Notification } from '../../enterprise/entities/notification'
import type { NotificationsRepository } from '../repositories/notification-repository'

interface ReadNotificationUseCaseRequest {
  notificationId: string
  recipientId: string
}
type ReadNotificationUseCaseResponse = Either<
  NotFoundError | NotAllowedError,
  {
    notification: Notification
  }
>

export class ReadNotificationUseCase {
  constructor(private notificationRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    notificationId,
  }: ReadNotificationUseCaseRequest): Promise<ReadNotificationUseCaseResponse> {
    const notification =
      await this.notificationRepository.findById(notificationId)

    if (!notification) {
      return left(new NotFoundError())
    }

    if (recipientId !== notification.recipientId.toString()) {
      return left(new NotAllowedError())
    }

    notification.read()

    await this.notificationRepository.save(notification)

    return right({
      notification,
    })
  }
}
