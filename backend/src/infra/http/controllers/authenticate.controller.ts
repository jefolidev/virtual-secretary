import { AuthenticateStudentUseCase } from '@/domain/scheduling/application/use-cases/authenticate-user'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
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

@Controller('/sessions')
@UsePipes(new ZodValidationPipe(authenticateBodySchema))
export class AuthenticateController {
  constructor(
    private readonly authenticateStudentUseCase: AuthenticateStudentUseCase
  ) {}

  @Post()
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const result = await this.authenticateStudentUseCase.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value
      throw new UnauthorizedException(error?.message ?? 'Unauthorized')
    }

    const { accessToken } = result.value

    return { access_token: accessToken }
  }
}
