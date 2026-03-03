import { Either, left, right } from '@/core/either'
import { Env } from '@/infra/env/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'

export interface RegisterCalendarWatchUseCaseRequest {
  professionalId: string
}

export type RegisterCalendarWatchUseCaseResponse = Either<string, void>

@Injectable()
export class RegisterCalendarWatchUseCase {
  constructor(
    private tokenRepository: GoogleCalendarTokenRepository,
    private configService: ConfigService<Env, true>,
  ) {}

  async execute({
    professionalId,
  }: RegisterCalendarWatchUseCaseRequest): Promise<RegisterCalendarWatchUseCaseResponse> {
    const webhookUrl = this.configService.get('GOOGLE_WEBHOOK_URL', {
      infer: true,
    })

    if (!webhookUrl) {
      return left('GOOGLE_WEBHOOK_URL is not configured')
    }

    try {
      await this.tokenRepository.registerWatch(professionalId, webhookUrl)
      console.log(
        `[RegisterCalendarWatch] Watch registered for professionalId=${professionalId}`,
      )
      return right(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return left(message)
    }
  }
}
