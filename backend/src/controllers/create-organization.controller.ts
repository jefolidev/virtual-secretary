import { CurrentUser } from '@/auth/current-user-decorator'
import { JwtAuthGuard, UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Post, UseGuards, UsePipes } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import z from 'zod'

const createOrganizationSchema = z.object({
  name: z.string().optional(),
})

@Controller('/organization')
@UseGuards(JwtAuthGuard)
export class CreateOrganizationController {
  constructor(
    private prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createOrganizationSchema))
  async handle(@CurrentUser() user: UserPayload) {
    return user.sub
  }
}
