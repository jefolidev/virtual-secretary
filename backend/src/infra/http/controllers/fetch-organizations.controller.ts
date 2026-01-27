import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import { Controller, Get, Query } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/organizations')
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
