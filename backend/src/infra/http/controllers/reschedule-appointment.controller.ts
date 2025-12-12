import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { NoDisponibilityError } from '@/domain/scheduling/application/use-cases/errors/no-disponibility-error'
import { RescheduleAppointmentUseCase } from '@/domain/scheduling/application/use-cases/reschedule-appointment'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  RescheduleAppointmentBodySchema,
  rescheduleAppointmentBodySchema,
} from './dto/reschedule-appointments.dtor'

@Controller('/appointments')
export class RescheduleAppointmentController {
  constructor(
    private readonly rescheduleAppointmentUseCase: RescheduleAppointmentUseCase
  ) {}

  @Patch('/:id/reschedule')
  async handle(
    @Body(new ZodValidationPipe(rescheduleAppointmentBodySchema))
    body: RescheduleAppointmentBodySchema,
    @Param('id') appointmentid: string
  ) {
    const { startDate, endDate } = body

    const result = await this.rescheduleAppointmentUseCase.execute({
      id: appointmentid,
      startDateTime: startDate,
      endDateTime: endDate,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case NoDisponibilityError:
          throw new ConflictException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const appointment = result.value.appointment

    return {
      appointment,
    }
  }
}
