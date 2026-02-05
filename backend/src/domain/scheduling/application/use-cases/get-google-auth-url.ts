import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'

export interface GetAuthUrlUseCaseRequest {
  professionalId: string
}

export type GetAuthUrlUseCaseResponse = Either<null, { authUrl: string }>

@Injectable()
export class GetAuthUrlUseCase {
  constructor(
    private googleCalendarTokenRepository: GoogleCalendarTokenRepository,
  ) {}

  async execute({
    professionalId,
  }: GetAuthUrlUseCaseRequest): Promise<GetAuthUrlUseCaseResponse> {
    const authUrl =
      await this.googleCalendarTokenRepository.getAuthUrl(professionalId)

    return right({ authUrl })
  }
}
