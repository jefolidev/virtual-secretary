import { JwtAuthGuard } from '@/auth/jwt.strategy'
import { PaginationQueryPipe } from '@/pipes/pagination-query.pipe'
import { PrismaService } from '@/prisma/prisma.service'
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
