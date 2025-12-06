import { UserAlreadyExists as UserAlreadyExistsError } from '@/domain/scheduling/application/use-cases/errors/user-already-exists'
import { RegisterUserUseCase } from '@/domain/scheduling/application/use-cases/register-user'
import { Public } from '@/infra/auth/public'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import {
  CreateUserAccountBodySchema,
  createUserAccountBodySchema,
} from './dto/create-account.dto'

@Controller('/register')
export class CreateAccountController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post()
  @Public()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserAccountBodySchema))
  async handle(@Body() body: CreateUserAccountBodySchema) {
    const { cpf, email, name, phone, password, address, role } = body

    const result = await this.registerUserUseCase.execute({
      address,
      cpf,
      email,
      name,
      phone,
      password,
      role,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    return result
  }
}
