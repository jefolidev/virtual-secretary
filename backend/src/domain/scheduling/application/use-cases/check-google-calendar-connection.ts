import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'

export interface CheckGoogleCalendarConnectionUseCaseRequest {
  professionalId: string
}

export type CheckGoogleCalendarConnectionUseCaseResponse = Either<
  null,
  { isConnected: boolean }
>

@Injectable()
export class CheckGoogleCalendarConnectionUseCase {
  constructor(
    private googleCalendarTokenRepository: GoogleCalendarTokenRepository,
  ) {}

  async execute({
    professionalId,
  }: CheckGoogleCalendarConnectionUseCaseRequest): Promise<CheckGoogleCalendarConnectionUseCaseResponse> {
    const isConnected =
      await this.googleCalendarTokenRepository.hasTokens(professionalId)

    return right({ isConnected })
  }
}
