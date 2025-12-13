import { FetchProfessionalUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional'
import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import { Controller, Get, Query } from '@nestjs/common'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/professionals')
export class FetchProfessionalController {
  constructor(
    private readonly fetchProfessionalUseCase: FetchProfessionalUseCase
  ) {}

  @Get()
  async handle(@Query('page', PaginationQueryPipe) page: PageQueryParamSchema) {
    return await this.fetchProfessionalUseCase.execute({ page })
  }
}
