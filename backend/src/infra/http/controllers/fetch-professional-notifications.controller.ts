import { FetchProfessionalNotificationsUseCase } from '@/domain/notifications/application/use-cases/fetch-professional-notifications'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { Controller, Get, Query } from '@nestjs/common'

@Controller('/me/notifications')
export class FetchProfessionalNotificationsController {
  constructor(
    private readonly fetchNotifications: FetchProfessionalNotificationsUseCase,
  ) {}

  @Get()
  async handle(
    @CurrentUser() { sub: userId }: UserPayload,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.fetchNotifications.execute({
      recipientId: userId,
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit, 10) : undefined,
    })

    const { notifications } = result.value as { notifications: any[] }

    return {
      notifications: notifications.map((n) => ({
        id: n.id.toString(),
        recipientId: n.recipientId.toString(),
        title: n.title,
        content: n.content,
        reminderType: n.reminderType,
        createdAt: n.createdAt,
        readAt: n.readAt ?? null,
      })),
    }
  }
}
