import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'
import { RegisterCalendarWatchUseCase } from './register-calendar-watch'

export interface HandleOAuthCallbackUseCaseRequest {
  code: string
  professionalId: string
}

export type HandleOAuthCallbackUseCaseResponse = Either<
  string,
  { googleAccountEmail: string }
>

@Injectable()
export class HandleOAuthCallbackUseCase {
  constructor(
    private tokenRepository: GoogleCalendarTokenRepository,
    private registerCalendarWatch: RegisterCalendarWatchUseCase,
  ) {}

  async execute({
    code,
    professionalId,
  }: HandleOAuthCallbackUseCaseRequest): Promise<HandleOAuthCallbackUseCaseResponse> {
    try {
      const googleAccountEmail = await this.tokenRepository.saveTokensFromCode(
        professionalId,
        code,
      )

      // Auto-register push notifications — non-blocking, degraded mode if it fails
      this.registerCalendarWatch.execute({ professionalId }).catch((error) => {
        console.warn(
          `[HandleOAuthCallbackUseCase] Failed to register calendar watch for professional ${professionalId}:`,
          error,
        )
      })

      return right({
        googleAccountEmail,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return left(errorMessage)
    }
  }
}
