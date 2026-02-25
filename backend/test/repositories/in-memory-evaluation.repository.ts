import { EvaluationRepository } from '@/domain/evaluation/application/repositories/evaluation.repository'
import { Evaluation } from '@/domain/evaluation/enterprise/entities/evaluation'

export class InMemoryEvaluationRepository extends EvaluationRepository {
  public items: Evaluation[] = []

  async create(evaluation: Evaluation): Promise<void> {
    this.items.push(evaluation)
  }
  async findManyByProfessionalId(
    professionalId: string,
  ): Promise<Evaluation[] | null> {
    const evaluations = this.items.filter(
      (evaluation) => evaluation.professionalId.toString() === professionalId,
    )
    return evaluations.length > 0 ? evaluations : null
  }
  async findByAppointmentId(appointmentId: string): Promise<Evaluation | null> {
    const evaluation = this.items.find(
      (e) => e.appointmentId.toString() === appointmentId,
    )
    return evaluation || null
  }
  async updateEvaluationComment(
    evaluationId: string,
    comment: string,
  ): Promise<void> {
    const evaluationIndex = this.items.findIndex(
      (e) => e.id.toString() === evaluationId,
    )
    if (evaluationIndex !== -1) {
      this.items[evaluationIndex].comment = comment
    }
  }
}
