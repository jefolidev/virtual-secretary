import { GoogleCalendarTokenRepository } from '@/domain/scheduling/application/repositories/google-calendar-token.repository'
import { RegisterCalendarWatchUseCase } from '@/domain/scheduling/application/use-cases/register-calendar-watch'
import { Injectable, OnModuleInit } from '@nestjs/common'

@Injectable()
export class RenewCalendarWatchService implements OnModuleInit {
  constructor(
    private tokenRepository: GoogleCalendarTokenRepository,
    private registerCalendarWatch: RegisterCalendarWatchUseCase,
  ) {}

  onModuleInit() {
    // Run once at startup, then every 24 hours
    this.renewExpiringWatches()
    setInterval(() => this.renewExpiringWatches(), 24 * 60 * 60 * 1000)
  }

  private async renewExpiringWatches() {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const expiringProfessionalIds =
        await this.tokenRepository.findExpiringWatches(tomorrow)

      for (const professionalId of expiringProfessionalIds) {
        const result = await this.registerCalendarWatch.execute({
          professionalId,
        })

        if (result.isLeft()) {
          console.warn(
            `[RenewCalendarWatchService] Failed to renew watch for professional ${professionalId}: ${result.value}`,
          )
        } else {
          console.log(
            `[RenewCalendarWatchService] Renewed watch for professional ${professionalId}`,
          )
        }
      }
    } catch (error) {
      console.error(
        '[RenewCalendarWatchService] Error renewing watches:',
        error,
      )
    }
  }
}
