import { RegisterUserUseCase } from '@/domain/scheduling/application/use-cases/register-user'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { checkPasswordStrong } from '@/utils/checkPasswordStrong'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import {
  CreateUserAccountBodySchema,
  createUserAccountBodySchema,
} from './dto/create-account.dto'

@Controller('/accounts')
export class CreateAccountController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registerUserUseCase: RegisterUserUseCase
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserAccountBodySchema))
  async handle(@Body() body: CreateUserAccountBodySchema) {
    const { cpf, email, name, phone, password, address, role } = body

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { cpf }, { phone }],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException(
          'User with same e-mail address already exists.'
        )
      }
      if (existingUser.cpf === cpf) {
        throw new ConflictException('User with same CPF already exists.')
      }
      if (existingUser.phone === phone) {
        throw new ConflictException(
          'User with same phone number already exists.'
        )
      }
    }

    const isStrongPassword = checkPasswordStrong(password)

    if (!isStrongPassword.isValid) {
      throw new BadRequestException({
        message: 'Senha fraca',
        errors: isStrongPassword.errors,
      })
    }

    const hashedPassword = await hash(password, 8)

    const result = await this.registerUserUseCase.execute({
      address,
      cpf,
      email,
      name,
      phone,
      password: hashedPassword,
      role,
    })

    return result

    // const professionalId = randomUUID()
    // const clientId = randomUUID()

    // const userWithAddress = await this.prisma.user.create({
    //   data: {
    //     cpf,
    //     email,
    //     role,
    //     name,
    //     phone,
    //     client:
    //       role === 'CLIENT'
    //         ? {
    //             create: {},
    //           }
    //         : undefined,
    //     professional:
    //       role === 'PROFESSIONAL'
    //         ? {
    //             create: {
    //               sessionPrice: 0,
    //             },
    //           }
    //         : undefined,
    //     password: hashedPassword,
    //     address: {
    //       create: {
    //         addressLine1: address.addressLine1,
    //         addressLine2: address.addressLine2,
    //         neighborhood: address.neighborhood,
    //         city: address.city,
    //         state: address.state,
    //         postalCode: address.postalCode,
    //         country: address.country,
    //       },
    //     },
    //   },
    //   include: {
    //     address: true,
    //     professional: true,
    //     client: true,
    //   },
    // })
    // return userWithAddress
  }
}
