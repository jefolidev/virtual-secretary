import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { CancelAppointmentUseCase } from '@/domain/scheduling/application/use-cases/cancel-appointment'
import { AlreadyCanceledError } from '@/domain/scheduling/application/use-cases/errors/already-canceled-error'
import { CannotCancelAppointmentError } from '@/domain/scheduling/application/use-cases/errors/cannot-cancel-appointment'
import {
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { AppointmentsPresenter } from '../presenters/appointments-presenter'

@Controller('/appointments')
export class CancelAppointmentController {
  constructor(
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase
  ) {}

  @Patch('/:id/cancel')
  async handle(@Param('id') appointmentid: string) {
    const result = await this.cancelAppointmentUseCase.execute({
      id: appointmentid,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case AlreadyCanceledError:
          throw new ConflictException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        case CannotCancelAppointmentError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const appointment = result.value.appointment

    return {
      appointment: AppointmentsPresenter.toHTTP(appointment),
    }
  }
}
