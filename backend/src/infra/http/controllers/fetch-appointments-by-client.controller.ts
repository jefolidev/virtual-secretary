import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { FetchScheduleByClientIdUseCase } from '@/domain/scheduling/application/use-cases/fetch-schedule-by-client-id'
import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { AppointmentsPresenter } from '../presenters/appointments-presenter'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/client/:id/appointments')
export class FetchAppointmentsByClientController {
  constructor(
    private readonly fetchAppointmentsByClientId: FetchScheduleByClientIdUseCase
  ) {}

  @Get()
  async handle(
    @Param('id') clientId,
    @Query('page', PaginationQueryPipe) page: PageQueryParamSchema
  ) {
    const result = await this.fetchAppointmentsByClientId.execute({
      clientId,
      page,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const appointments = result.value.appointments

    return {
      appointments: appointments.map(AppointmentsPresenter.toHTTP),
    }
  }
}
