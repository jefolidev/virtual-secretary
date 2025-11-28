import { JwtAuthGuard } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Get, UseGuards } from '@nestjs/common'

@Controller('/clients')
@UseGuards(JwtAuthGuard)
export class FetchClientController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async handle() {
    return await this.prisma.client.findMany({
      include: {
        users: true,
      },
    })
  }
}
