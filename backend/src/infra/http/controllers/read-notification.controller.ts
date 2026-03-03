import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ReadNotificationUseCase } from '@/domain/notifications/application/use-cases/read-notification'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
    BadRequestException,
    Controller,
    ForbiddenException,
    NotFoundException,
    Param,
    Patch,
} from '@nestjs/common'

@Controller('/notifications/:id/read')
export class ReadNotificationController {
  constructor(private readonly readNotification: ReadNotificationUseCase) {}

  @Patch()
  async handle(
    @CurrentUser() { sub: userId }: UserPayload,
    @Param('id') notificationId: string,
  ) {
    const result = await this.readNotification.execute({
      notificationId,
      recipientId: userId,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
