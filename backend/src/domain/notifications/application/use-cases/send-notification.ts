import { Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { NotificationType } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import { Injectable } from '@nestjs/common'
import { Notification } from '../../enterprise/entities/notification'
import { NotificationsRepository } from '../repositories/notification-repository'

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
    private notificationRepository: NotificationsRepository,
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
      await this.professionalRepository.findByProfessionalIdWithNotificationSettings(
        recipientId,
      )

    if (professional) {
      if (
        !professional.notificationSettings?.enabledTypes.includes(reminderType)
      ) {
        return right({})
      }
    }

    await this.notificationRepository.create(notification)

    return right({
      notification,
    })
  }
}
