import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { Injectable } from '@nestjs/common'
import { EvaluationRepository } from '../repositories/evaluation.repository'
import { AppointmentIsntAwaitingCommentError } from './errors/appointment-isnt-awaiting-comment'

export interface SendEvaluationCommentUseCaseRequest {
  appointmentId: string
  comment: string
}
export type SendEvaluationCommentUseCaseResponse = Either<
  NotFoundError | AppointmentIsntAwaitingCommentError,
  {}
>

@Injectable()
export class SendEvaluationCommentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentsRepository,
    private readonly evaluationRepository: EvaluationRepository,
  ) {}

  async execute({
    appointmentId,
    comment,
  }: SendEvaluationCommentUseCaseRequest): Promise<SendEvaluationCommentUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    if (appointment.status !== 'AWAITING_COMMENT') {
      return left(new AppointmentIsntAwaitingCommentError())
    }

    const evaluation =
      await this.evaluationRepository.findByAppointmentId(appointmentId)

    if (!evaluation) {
      return left(new NotFoundError('Evaluation not found'))
    }

    await this.evaluationRepository.updateEvaluationComment(
      evaluation.id.toString(),
      comment,
    )

    appointment.status = 'COMPLETED'
    await this.appointmentRepository.save(appointment)

    return right({})
  }
}
