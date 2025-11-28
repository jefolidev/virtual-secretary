import { JwtAuthGuard } from '@/auth/jwt.strategy'
import { PaginationQueryPipe } from '@/pipes/pagination-query.pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/clients')
@UseGuards(JwtAuthGuard)
export class FetchClientController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async handle(@Query('page', PaginationQueryPipe) page: PageQueryParamSchema) {
    return await this.prisma.client.findMany({
      take: 10,
      skip: (page - 1) * 1,
      include: {
        users: true,
      },
    })
  }
}
