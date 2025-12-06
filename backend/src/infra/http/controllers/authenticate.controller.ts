import { AuthenticateStudentUseCase } from '@/domain/scheduling/application/use-cases/authenticate-user'
import { WrongCredentialsError } from '@/domain/scheduling/application/use-cases/errors/wrong-credentials-error'
import { Public } from '@/infra/auth/public'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import z from 'zod'

const authenticateBodySchema = z.object({
  email: z.email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/login')
@Public()
export class AuthenticateController {
  constructor(
    private readonly authenticateStudentUseCase: AuthenticateStudentUseCase
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    console.log('AQUI')

    const result = await this.authenticateStudentUseCase.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const { accessToken } = result.value

    return { access_token: accessToken }
  }
}
