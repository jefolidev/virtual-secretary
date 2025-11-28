import { JwtAuthGuard } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Get, UseGuards } from '@nestjs/common'

@Controller('/professionals')
@UseGuards(JwtAuthGuard)
export class FetchProfessionalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async handle() {
    return await this.prisma.professional.findMany({
      include: {
        users: true,
      },
    })
  }
}
