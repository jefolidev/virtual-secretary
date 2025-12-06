import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { HashGenerator } from '../cryptography/hash-generator'
import { UserRepository } from '../repositories/user.repository'
import { PasswordDoesntMatchesError } from './errors/password-does-not-matches'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

// TODO: Implement email service: EmailBuilder.js and Nodemailer

export interface ForgotPasswordUseCaseRequest {
  email: string
  newPasswordConfirmation: string
  newPassword: string
}

export type ForgotPasswordUseCaseResponse = Either<
  WrongCredentialsError | PasswordDoesntMatchesError,
  {}
>

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashGenerator: HashGenerator
  ) {}

  async execute({
    email,
    newPassword,
    newPasswordConfirmation,
  }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      return left(new WrongCredentialsError())
    }

    if (newPassword !== newPasswordConfirmation) {
      return left(new PasswordDoesntMatchesError())
    }

    const hashedPassword = await this.hashGenerator.hash(newPassword)

    await this.userRepository.resetPassword(user.id.toString(), hashedPassword)

    // await this.emailService.sendPasswordResetEmail(user.id, hashedPassword)

    return right({})
  }
}
