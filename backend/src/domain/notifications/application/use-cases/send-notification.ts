import { Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'
import { Notification } from '../../enterprise/entities/notification'

import { NotificationsRepository } from '@/domain/notifications/application/repositories/notification.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { NotificationType } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'

export interface SendNotificationUseCaseRequest {
  recipientId: string
  title: string
  content: string
  reminderType: NotificationType
}
export type SendNotificationUseCaseResponse = Either<
  null,
  {
    notification?: Notification
  }
>

@Injectable()
export class SendNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationsRepository,
    private readonly professionalRepository: ProfessionalRepository,
  ) {}

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

    const professional =
      await this.professionalRepository.findByUserId(recipientId)

    if (professional) {
      const settings = (professional as any).notificationSettings

      if (settings && !settings.enabledTypes.includes(reminderType)) {
        return right({})
      }
    }

    await this.notificationRepository.create(notification)

    return right({
      notification,
    })
  }
}
