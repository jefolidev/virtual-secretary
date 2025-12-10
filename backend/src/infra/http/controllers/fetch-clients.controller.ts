import { FetchClientsUseCase } from '@/domain/scheduling/application/use-cases/fetch-client'
import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { ClientsPresenter } from '../presenters/clients-presenter'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/clients')
export class FetchClientController {
  constructor(private readonly fetchClientsUseCase: FetchClientsUseCase) {}

  @Get()
  async handle(@Query('page', PaginationQueryPipe) page: PageQueryParamSchema) {
    const result = await this.fetchClientsUseCase.execute({
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const clients = result.value.clients

    return {
      clients: clients.map(ClientsPresenter.toHTTP),
    }
  }
}
