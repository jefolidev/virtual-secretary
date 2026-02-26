import { Evaluation } from '@/domain/evaluation/enterprise/entities/evaluation'

export class EvaluationPresenter {
  static toHTTP(evaluation: Evaluation) {
    return {
      id: evaluation.id.toString(),
      appointmentId: evaluation.appointmentId.toString(),
      score: evaluation.score,
      comment: evaluation.comment,
      createdAt: evaluation.createdAt,
    }
  }
}
