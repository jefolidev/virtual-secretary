import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Evaluation } from '@/domain/evaluation/enterprise/entities/evaluation'
import { Evaluation as PrismaEvaluationUser } from '@prisma/client'

export class PrismaEvaluationMapper {
  static toPrisma(evaluation: Evaluation): PrismaEvaluationUser {
    return {
      id: evaluation.id.toString(),
      professionalId: evaluation.professionalId.toString(),
      appointmentId: evaluation.appointmentId.toString(),
      score: evaluation.score,
      comment: evaluation.comment || '',
      createdAt: evaluation.createdAt,
    }
  }

  static toDomain(raw: PrismaEvaluationUser): Evaluation {
    return Evaluation.create(
      {
        professionalId: raw.professionalId,
        appointmentId: raw.appointmentId,
        score: raw.score,
        comment: raw.comment || '',
      },
      new UniqueEntityId(raw.id),
    )
  }
}
