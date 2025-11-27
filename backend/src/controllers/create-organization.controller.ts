import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Post, UseGuards, UsePipes } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import z from 'zod'

const createOrganizationSchema = z.object({
  name: z.string(),
})

@Controller('/organization')
@UseGuards(AuthGuard('jwt'))
export class CreateOrganizationController {
  constructor(
    private prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createOrganizationSchema))
  async handle() {
    return 'oi'
  }
}
