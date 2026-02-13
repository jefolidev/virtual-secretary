import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { PasswordDoesntMatchesError } from '@/domain/scheduling/application/use-cases/errors/password-does-not-matches'
import { WrongCredentialsError } from '@/domain/scheduling/application/use-cases/errors/wrong-credentials-error'
import { ForgotPasswordUseCase } from '@/domain/scheduling/application/use-cases/forgot-password'
import { Public } from '@/infra/auth/public'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  forgotPasswordBodySchema,
  ForgotPasswordBodySchema,
} from './dto/forgot-password.dto'

@Controller('/forgot-password')
export class ForgotPasswordController {
  constructor(
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly userRepository: UserRepository,
  ) {}

  @Post()
  @Public()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(forgotPasswordBodySchema))
    body: ForgotPasswordBodySchema,
  ) {
    const { newPassword, newPasswordConfirmation, email } = body

    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const result = await this.forgotPasswordUseCase.execute({
      email: user.email,
      newPassword,
      newPasswordConfirmation,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        case PasswordDoesntMatchesError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }
  }
}
