import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
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
  password: z.string().min(6, 'Password must have at least 6 characters'),
  cpf: z.string().refine((value) => cpfParser.isValid(value), 'Invalid CPF'),
  phone: z
    .string()
    .min(9, 'Phone must have at least 9 characters')
    .max(9, 'Phone must have just 9 characters'),
  address: z.object({
    addressLine1: z.string(),
    addressLine2: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    postalCode: z.string(),
    country: z.string().default('Brasil'),
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

    if (userWithSameEmail) {
      throw new ConflictException(
        'User with same e-mail address already exists.'
      )
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
