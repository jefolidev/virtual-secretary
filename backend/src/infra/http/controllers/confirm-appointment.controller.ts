import { BadRequestError } from '@/core/errors/bad-request'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { ConfirmAppointmentUseCase } from '@/domain/scheduling/application/use-cases/confirm-appointment'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { AppointmentsPresenter } from '../presenters/appointments-presenter'

@Controller('/appointments')
export class ConfirmAppointmentController {
  constructor(
    private readonly confirmAppointmentUseCase: ConfirmAppointmentUseCase,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  @Patch('/:id/confirm')
  async handle(
    @Param('id') appointmentId: string,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new NotFoundException('Porfessional not found.')
    }

    const result = await this.confirmAppointmentUseCase.execute({
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

      throw new BadRequestException('Bad Request')
    }

    if (result.isRight()) {
      const appointment = result.value.appointment

      return {
        appointment: AppointmentsPresenter.toHTTP(appointment),
      }
    }

    throw new BadRequestException('Unexpected error')
  }
}
