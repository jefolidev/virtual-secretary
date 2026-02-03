import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'

export interface HandleOAuthCallbackUseCaseRequest {
  code: string
  professionalId: string
}

export type HandleOAuthCallbackUseCaseResponse = Either<
  null,
  { message: string }
>

@Injectable()
export class HandleOAuthCallbackUseCase {
  constructor(private tokenRepository: GoogleCalendarTokenRepository) {}

  async execute({
    code,
    professionalId,
  }: HandleOAuthCallbackUseCaseRequest): Promise<HandleOAuthCallbackUseCaseResponse> {
    const tokens = await this.tokenRepository.saveTokensFromCode(
      professionalId,
      code,
    )

    return right({ message: 'Tokens saved successfully' })
  }
}
