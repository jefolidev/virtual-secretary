import { JwtAuthGuard } from '@/infra/auth/jwt.strategy'
import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/organizations')
@UseGuards(JwtAuthGuard)
export class FetchOrganizationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async handle(@Query('page', PaginationQueryPipe) page: PageQueryParamSchema) {
    return await this.prisma.organization.findMany({
      take: 10,
      skip: (page - 1) * 1,
    })
  }
}
