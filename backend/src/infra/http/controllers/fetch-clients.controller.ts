import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import { Controller, Get, Query } from '@nestjs/common'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/clients')
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
