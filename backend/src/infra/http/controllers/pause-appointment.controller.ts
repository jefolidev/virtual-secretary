import { BadRequestError } from '@/core/errors/bad-request'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { PauseAppointmentUseCase } from '@/domain/scheduling/application/use-cases/pause-appointment'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { AppointmentsPresenter } from '../presenters/appointments-presenter'

@Controller('/sessions')
export class PauseAppointmentController {
  constructor(
    private readonly pauseAppointmentUseCase: PauseAppointmentUseCase,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  @Post('/:id/pause')
  async handle(
    @Param('id') appointmentId: string,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new NotFoundException('Professional not found.')
    }

    const result = await this.pauseAppointmentUseCase.execute({
      appointmentId,
      professionalId: professional.id.toString(),
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message)
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message)
      }

      if (error instanceof BadRequestError) {
        throw new BadRequestException(error.message)
      }

      throw new BadRequestException('Unknown error occurred')
    }

    return {
      appointment: AppointmentsPresenter.toHTTP(result.value.appointment),
    }
  }
}
