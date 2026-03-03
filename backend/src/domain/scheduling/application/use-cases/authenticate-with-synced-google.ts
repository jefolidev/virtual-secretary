import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '../cryptography/encrypter'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'
import { UserRepository } from '../repositories/user.repository'
import { RegisterCalendarWatchUseCase } from './register-calendar-watch'

interface AuthenticateWithSyncedGoogleUseCaseRequest {
  email: string
  firstName: string
  lastName: string
  picture: string
}

type AuthenticateWithSyncedGoogleUseCaseResponse = Either<
  NotFoundError,
  {
    accessToken: string
    user: {
      id: string
      name: string
      email: string
      role: string
      picture: string
    }
  }
>

@Injectable()
export class AuthenticateWithSyncedGoogleUseCase {
  constructor(
    private tokenRepository: GoogleCalendarTokenRepository,
    private usersRepository: UserRepository,
    private encrypter: Encrypter,
    private registerCalendarWatch: RegisterCalendarWatchUseCase,
  ) {}

  async execute({
    email,
    firstName,
    lastName,
    picture,
  }: AuthenticateWithSyncedGoogleUseCaseRequest): Promise<AuthenticateWithSyncedGoogleUseCaseResponse> {
    const token = await this.tokenRepository.findByGoogleEmail(email)

    if (!token) {
      return left(
        new NotFoundError(
          'No Google account synced with this email. Please connect your Google Calendar first.',
        ),
      )
    }

    const user = await this.usersRepository.findByProfessionalId(
      token.professionalId,
    )

    if (!user) {
      return left(
        new NotFoundError('User associated with this account not found.'),
      )
    }

    if (!token.syncToken) {
      this.registerCalendarWatch
        .execute({ professionalId: token.professionalId })
        .catch((error) => {
          console.warn(
            `[AuthenticateWithSyncedGoogleUseCase] Failed to register calendar watch for professional ${token.professionalId}:`,
            error,
          )
        })
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    })

    return right({
      accessToken,
      user: {
        id: user.id.toString(),
        name: `${firstName} ${lastName}`,
        email: user.email,
        role: user.role,
        picture,
      },
    })
  }
}

