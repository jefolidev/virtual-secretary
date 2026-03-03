import { HandleCalendarPushNotificationUseCase } from '@/domain/scheduling/application/use-cases/handle-calendar-push-notification'
import { Public } from '@/infra/auth/public'
import { Controller, Headers, HttpCode, Post } from '@nestjs/common'

@Controller('calendar/sync')
export class GoogleCalendarSyncController {
  constructor(
    private handleCalendarPushNotification: HandleCalendarPushNotificationUseCase,
  ) {}

  @Post()
  @Public()
  @HttpCode(200)
  async handleSync(
    @Headers('x-goog-channel-id') channelId: string,
    @Headers('x-goog-resource-state') resourceState: string,
  ) {
    if (!channelId || !resourceState) {
      return
    }

    // Fire-and-forget — Google requires a fast 200 OK response
    this.handleCalendarPushNotification
      .execute({ channelId, resourceState })
      .catch((error) => {
        console.error(
          '[GoogleCalendarSyncController] Error handling push notification:',
          error,
        )
      })

    return
  }
}
