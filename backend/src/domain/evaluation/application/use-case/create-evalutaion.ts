import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { Evaluation } from '../../enterprise/entities/evaluation'
import { EvaluationRepository } from '../repositories/evaluation.repository'

export interface CreateEvaluationUseCaseRequest {
  appointmentId: string
  professionalId: string

  score: number
  comment?: string
}
export type CreateEvaluationUseCaseResponse = Either<
  NotFoundError,
  {
    evaluation?: Evaluation
  }
>

export class CreateEvaluationUseCase {
  constructor(
    private readonly evaluationRepository: EvaluationRepository,
    private readonly appointmentRepository: AppointmentsRepository,
  ) {}

  async execute({
    appointmentId,
    professionalId,
    score,
    comment,
  }: CreateEvaluationUseCaseRequest): Promise<CreateEvaluationUseCaseResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      return left(new NotFoundError('Appointment not found'))
    }

    const evaluation = Evaluation.create({
      appointmentId,
      professionalId,
      score,
      comment: comment ?? '',
    })

    await this.evaluationRepository.create(evaluation)

    return right({
      evaluation,
    })
  }
}
