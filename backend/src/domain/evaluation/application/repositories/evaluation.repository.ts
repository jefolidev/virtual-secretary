import { Evaluation } from '../../enterprise/entities/evaluation'

export abstract class EvaluationRepository {
  abstract create(evaluation: Evaluation): Promise<void>
  abstract findManyByProfessionalId(
    professionalId: string,
  ): Promise<Evaluation[] | null>
}
