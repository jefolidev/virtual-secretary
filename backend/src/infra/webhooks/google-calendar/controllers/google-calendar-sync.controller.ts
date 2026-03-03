import { HandleCalendarPushNotificationUseCase } from '@/domain/scheduling/application/use-cases/handle-calendar-push-notification'
import { Public } from '@/infra/auth/public'
import { Controller, Headers, HttpCode, Post } from '@nestjs/common'

@Controller('calendar/sync')
export class GoogleCalendarSyncController {
  private processingChannels = new Set<string>()

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
      return { success: true }
    }

    if (this.processingChannels.has(channelId)) {
      return { success: true }
    }

    this.processingChannels.add(channelId)

    setImmediate(() => {
      this.handleCalendarPushNotification
        .execute({ channelId, resourceState })
        .catch((error) => {
          console.error(
            '[GoogleCalendarSyncController] Error handling push notification:',
            error?.message || error,
          )
        })
        .finally(() => {
          setTimeout(() => {
            this.processingChannels.delete(channelId)
          }, 5000)
        })
    })

    return { success: true }
  }
}
