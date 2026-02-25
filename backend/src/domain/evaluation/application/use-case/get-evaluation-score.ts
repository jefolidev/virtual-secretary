import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { Evaluation } from '../../enterprise/entities/evaluation'
import { EvaluationRepository } from '../repositories/evaluation.repository'
import { AppointmentIsntAwaitingScoreError } from './errors/appointment-isnt-awaiting-score'

export interface GetEvaluationScoreUseCaseRequest {
  appointmentId: string
  score: number
}

export type GetEvaluationScoreUseCaseResponse = Either<
  NotFoundError | AppointmentIsntAwaitingScoreError,
  {}
>

export class GetEvaluationScoreUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentsRepository,
    private readonly evaluationRepository: EvaluationRepository,
  ) {}

  async execute({
    appointmentId,
    score,
  }: GetEvaluationScoreUseCaseRequest): Promise<GetEvaluationScoreUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    if (appointment.status !== 'AWAITING_SCORE') {
      return left(new AppointmentIsntAwaitingScoreError())
    }

    const evaluation = Evaluation.create({
      appointmentId,
      professionalId: appointment.professionalId.toString(),
      score,
    })

    await this.evaluationRepository.create(evaluation)

    appointment.status = 'AWAITING_COMMENT'

    await this.appointmentRepository.save(appointment)

    return right({})
  }
}
