import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'

export interface HandleOAuthCallbackUseCaseRequest {
  code: string
  professionalId: string
}

export type HandleOAuthCallbackUseCaseResponse = Either<
  null,
  { googleAccountEmail: string }
>

@Injectable()
export class HandleOAuthCallbackUseCase {
  constructor(private tokenRepository: GoogleCalendarTokenRepository) {}

  async execute({
    code,
    professionalId,
  }: HandleOAuthCallbackUseCaseRequest): Promise<HandleOAuthCallbackUseCaseResponse> {
    const googleAccountEmail = await this.tokenRepository.saveTokensFromCode(
      professionalId,
      code,
    )

    return right({
      googleAccountEmail,
    })
  }
}
