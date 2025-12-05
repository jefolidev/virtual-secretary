import { RegisterUserUseCase } from '@/domain/scheduling/application/use-cases/register-user'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { checkPasswordStrong } from '@/utils/checkPasswordStrong'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import {
  CreateUserAccountBodySchema,
  createUserAccountBodySchema,
} from './dto/create-account.dto'

@Controller('/accounts')
export class CreateAccountController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post()
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

    return result
  }
}
