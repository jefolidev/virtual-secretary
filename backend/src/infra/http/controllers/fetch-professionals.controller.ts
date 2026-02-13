import { FetchProfessionalUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional'
import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { UserProfessionalWithSettingsPresenter } from '../presenters/user-profissional-with-settings-presenter'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/professionals')
export class FetchProfessionalController {
  constructor(
    private readonly fetchProfessionalUseCase: FetchProfessionalUseCase,
  ) {}

  @Get()
  async handle(@Query('page', PaginationQueryPipe) page: PageQueryParamSchema) {
    const result = await this.fetchProfessionalUseCase.execute({ page })

    if (result.isLeft()) {
      throw new BadRequestException('Bad Request')
    }

    const professionals = result.value.professionals

    return professionals.map(UserProfessionalWithSettingsPresenter.toHTTP)
  }
}
