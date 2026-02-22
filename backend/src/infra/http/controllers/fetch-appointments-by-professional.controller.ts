import { NotFoundError } from '@/core/errors/resource-not-found-error'
import {
  FetchScheduleByProfessionalIdModality,
  FetchScheduleByProfessionalIdPaymentStatus,
  FetchScheduleByProfessionalIdPeriod,
  FetchScheduleByProfessionalIdStatus,
  FetchScheduleByProfessionalIdUseCase,
} from '@/domain/scheduling/application/use-cases/fetch-schedule-by-professional-id'
import { PaginationQueryPipe } from '@/infra/http/pipes/pagination-query.pipe'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { AppointmentWithClientPresenter } from '../presenters/appointments-with-client-presenter'
import { PageQueryParamSchema } from './dto/page-query.dto'

@Controller('/professional/:id/appointments')
export class FetchAppointmentsByProfessionalController {
  constructor(
    private readonly fetchAppointmentsByProfessionalId: FetchScheduleByProfessionalIdUseCase,
  ) {}

  @Get()
  async handle(
    @Param('id') professionalId,
    @Query('page', PaginationQueryPipe) page: PageQueryParamSchema,
    @Query('period') period: FetchScheduleByProfessionalIdPeriod,
    @Query('status') status: FetchScheduleByProfessionalIdStatus,
    @Query('paymentStatus')
    paymentStatus: FetchScheduleByProfessionalIdPaymentStatus,
    @Query('modality') modality: FetchScheduleByProfessionalIdModality,
  ) {
    const filters = {
      period: period || 'all',
      status: status || 'all',
      paymentStatus: paymentStatus || 'all',
      modality: modality || 'all',
    }

    const result = await this.fetchAppointmentsByProfessionalId.execute({
      professionalId,
      page,
      filters,
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
      pages: result.value.pages,
    }
  }
}
