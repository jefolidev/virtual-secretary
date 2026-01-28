import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { FetchScheduleByProfessionalIdUseCase } from '@/domain/scheduling/application/use-cases/fetch-schedule-by-professional-id'
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
import { AppointmentWithClient } from '@/domain/scheduling/enterprise/entities/value-objects/appointment-with-client'
import { AppointmentWithClientPresenter } from '../presenters/appointments-with-client-presenter'

@Controller('/professional/:id/appointments')
export class FetchAppointmentsByProfessionalController {
  constructor(
    private readonly fetchAppointmentsByProfessionalId: FetchScheduleByProfessionalIdUseCase
  ) {}

  @Get()
  async handle(
    @Param('id') professionalId,
    @Query('page', PaginationQueryPipe) page: PageQueryParamSchema
  ) {
    const result = await this.fetchAppointmentsByProfessionalId.execute({
      professionalId,
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
      appointments: appointments.map(AppointmentWithClientPresenter.toHTTP),
    }
  }
}
