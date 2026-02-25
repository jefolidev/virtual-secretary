import { Evaluation } from '../../enterprise/entities/evaluation';

export abstract class EvaluationRepository {
  abstract create(evaluation: Evaluation): Promise<void>
  abstract findManyByProfessionalId(
    professionalId: string,
  ): Promise<Evaluation[] | null>
  abstract findByAppointmentId(
    appointmentId: string,
  ): Promise<Evaluation | null>
  abstract updateEvaluationComment(
    evaluationId: string,
    comment: string,
  ): Promise<void>
}
