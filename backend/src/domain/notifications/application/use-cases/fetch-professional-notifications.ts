import { Either, right } from '@/core/either'
import { NotificationsRepository } from '@/domain/notifications/application/repositories/notification.repository'
import { Notification } from '@/domain/notifications/enterprise/entities/notification'
import { Injectable } from '@nestjs/common'

interface FetchProfessionalNotificationsUseCaseRequest {
  recipientId: string
  unreadOnly?: boolean
  limit?: number
}

type FetchProfessionalNotificationsUseCaseResponse = Either<
  null,
  { notifications: Notification[] }
>

@Injectable()
export class FetchProfessionalNotificationsUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    unreadOnly,
    limit,
  }: FetchProfessionalNotificationsUseCaseRequest): Promise<FetchProfessionalNotificationsUseCaseResponse> {
    const notifications =
      await this.notificationsRepository.findManyByRecipientId(recipientId, {
        unreadOnly,
        limit,
      })

    return right({ notifications })
  }
}
