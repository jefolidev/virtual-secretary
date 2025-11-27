import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { checkPasswordStrong } from '@/utils/checkPasswordStrong'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import { cpf as cpfParser } from 'cpf-cnpj-validator'
import z from 'zod'

const createAccountBodySchema = z.object({
  name: z.string().min(2, 'Name must have more than 2 characters.'),
  email: z.email('Invalid email'),
  password: z.string().refine(checkPasswordStrong, {
    message:
      'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número',
  }),
  cpf: z.string().refine((value) => cpfParser.isValid(value), 'Invalid CPF'),
  phone: z
    .string()
    .min(9, 'Phone must have at least 9 characters')
    .max(9, 'Phone must have just 9 characters'),
  address: z.object({
    addressLine1: z.string().min(1, 'Address must be provided'),
    addressLine2: z.string().optional(),
    neighborhood: z.string().min(1, 'Neighborhood must be provided'),
    city: z.string().min(1, 'City must be provided'),
    state: z.string().min(1, 'State must be provided'),
    postalCode: z.string().min(8, 'Postal code must be provided'),
    country: z.string().min(1, 'Country must be provided').default('Brasil'),
  }),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getUsers() {
    return await this.prisma.user.findMany({
      include: {
        address: true,
      },
    })
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { cpf, email, name, phone, password, address } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    const userWithSameCpf = await this.prisma.user.findUnique({
      where: {
        cpf,
      },
    })

    const userWithSamePhone = await this.prisma.user.findUnique({
      where: {
        phone,
      },
    })

    if (userWithSameEmail) {
      throw new ConflictException(
        'User with same e-mail address already exists.'
      )
    }

    if (userWithSameCpf) {
      throw new ConflictException('User with same cpf address already exists.')
    }

    if (userWithSamePhone) {
      throw new ConflictException(
        'User with same phone address already exists.'
      )
    }

    const isStrongPassword = checkPasswordStrong(password)

    if (!isStrongPassword.isValid) {
      throw new BadRequestException({
        message: 'Senha fraca',
        errors: isStrongPassword.errors,
      })
    }

    const hashedPassword = await hash(password, 8)

    const userWithAddress = await this.prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          cpf,
          email,
          name,
          phone,
          password: hashedPassword,
          address: {
            create: {
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2,
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
            },
          },
        },
      })
    })
    return userWithAddress
  }
}
