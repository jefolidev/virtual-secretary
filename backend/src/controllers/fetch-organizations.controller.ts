import { JwtAuthGuard } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Get, UseGuards } from '@nestjs/common'

@Controller('/organizations')
@UseGuards(JwtAuthGuard)
export class FetchOrganizationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async handle() {
    return await this.prisma.organization.findMany()
  }
}
