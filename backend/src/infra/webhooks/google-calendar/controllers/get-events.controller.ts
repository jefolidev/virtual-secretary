import { FetchProfessionalEventsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-events'
import { PageQueryParamSchema } from '@/infra/http/controllers/dto/page-query.dto'
import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import { CalendarEventPresenter } from '@/infra/http/presenters/google-calendar-event-presenter'
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'

@Controller('events')
export class GetEventsController {
  constructor(
    private readonly fetchProfessionalEventsUseCase: FetchProfessionalEventsUseCase,
  ) {}

  @Get('/:id')
  async handle(
    @Param('id') professionalId: string,
    @Query('page', PaginationQueryPipe) page: PageQueryParamSchema,
  ) {
    const result = await this.fetchProfessionalEventsUseCase.execute({
      professionalId,
      page,
    })

    if (result.isLeft()) {
      const error = result.value
      if (!error) return []
      throw new BadRequestException('Bad Request')
    }

    return {
      events: result.value.events.map(CalendarEventPresenter.toHTTP),
    }
  }
}
