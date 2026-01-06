import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TokenInvalidator } from '../cryptography/token-invalidator'

interface LogoutUseCaseRequest {
  userId: string
  token: string
}

type LogoutUseCaseResponse = Either<null, { success: boolean }>

@Injectable()
export class LogoutUseCase {
  constructor(private readonly tokenInvalidator: TokenInvalidator) {}

  async execute({
    userId,
    token,
  }: LogoutUseCaseRequest): Promise<LogoutUseCaseResponse> {
    // Invalidar o token na blacklist
    await this.tokenInvalidator.invalidate(token)

    // Limpar tokens expirados (cleanup automático)
    await this.tokenInvalidator.cleanup()

    return right({ success: true })
  }
}
