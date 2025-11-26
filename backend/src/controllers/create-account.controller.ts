import { PrismaService } from '@/prisma/prisma.service'
import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { UserCreateInput } from '@prisma/generated/models'
import { hash } from 'bcryptjs'

@Controller('/accounts')
export class CreateAccountController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(@Body() body: UserCreateInput) {
    const { cpf, email, name, phone, password } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (userWithSameEmail) {
      throw new ConflictException(
        'User with same e-mail address already exists.'
      )
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.user.create({
      data: {
        cpf,
        email,
        name,
        phone,
        password: hashedPassword,
      },
    })
  }
}
