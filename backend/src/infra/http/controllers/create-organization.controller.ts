import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import { Slug } from '@/utils/slug'
import {
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common'
import {
  createOrganizationSchema,
  CreateOrganizationSchema,
} from './dto/create-organization.dto'

const bodyValidationPipe = new ZodValidationPipe(createOrganizationSchema)

@Controller('/organization')
export class CreateOrganizationController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe)
    body: CreateOrganizationSchema,
    @CurrentUser() user: UserPayload
  ) {
    const { address, name, professionalsIds, cnpj } = body
    const existingOrganization = await this.prisma.organization.findFirst({
      where: {
        OR: [{ name }, { cnpj }],
      },
    })

    if (existingOrganization) {
      if (existingOrganization.name === name) {
        throw new ConflictException(
          'Already exists an organization with same name.'
        )
      }
      if (existingOrganization.cnpj === cnpj) {
        throw new ConflictException(
          'Already exists an organization with same CNPJ.'
        )
      }
    }

    let missingIds: string[] = []

    if (professionalsIds && professionalsIds.length > 0) {
      const existingProfessionals = await this.prisma.professional.findMany({
        where: { id: { in: professionalsIds } },
        select: { id: true },
      })

      const foundIds = existingProfessionals.map((p) => p.id)

      missingIds = professionalsIds.filter((id) => !foundIds.includes(id))

      if (missingIds.length > 0) {
        throw new NotFoundException(
          `The following professional ID(s) were not found: ${missingIds.join(
            ', '
          )}.`
        )
      }
    }

    const professionals =
      professionalsIds && professionalsIds.length > 0
        ? {
            connect: professionalsIds.map((id) => ({ id })),
          }
        : undefined

    return await this.prisma.organization.create({
      data: {
        name,
        slug: Slug.createFromText(name).toString(),
        ownerId: user.sub,
        cnpj,
        professionals,
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
      include: {
        address: true,
        professionals: true,
      },
    })
  }
}
