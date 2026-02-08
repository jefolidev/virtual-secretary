import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TokenInvalidator } from '../cryptography/token-invalidator'
import {
  CookieClearOptions,
  UserRepository,
} from '../repositories/user.repository'

interface LogoutUseCaseRequest {
  userId: string
  token: string
  cookieOptions: CookieClearOptions
}

type LogoutUseCaseResponse = Either<null, { success: boolean }>

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly tokenInvalidator: TokenInvalidator,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    userId,
    token,
    cookieOptions,
  }: LogoutUseCaseRequest): Promise<LogoutUseCaseResponse> {
    // Invalidar o token na blacklist
    if (token) {
      await this.tokenInvalidator.invalidate(token)
    }

    // Limpar cookies via repository
    this.userRepository.clearAuthCookies(cookieOptions)

    return right({ success: true })
  }
}
