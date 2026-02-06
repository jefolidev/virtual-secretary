import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '../cryptography/encrypter'
import { UserRepository } from '../repositories/user.repository'

interface AuthenticateWithGoogleUseCaseRequest {
  email: string
  firstName: string
  lastName: string
  picture: string
}

type AuthenticateWithGoogleUseCaseResponse = Either<
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
export class AuthenticateWithGoogleUseCase {
  constructor(
    private usersRepository: UserRepository,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    firstName,
    lastName,
    picture,
  }: AuthenticateWithGoogleUseCaseRequest): Promise<AuthenticateWithGoogleUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return left(
        new NotFoundError(
          'User not found. Please create an account first before logging in with Google.',
        ),
      )
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
