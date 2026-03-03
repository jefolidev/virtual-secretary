import { Evaluation } from '../../enterprise/entities/evaluation'

export interface EvaluationStats {
  averageScore: number
  total: number
  // distribuição de contagens por nota (ex.: { "0": 1, "1": 0, ..., "10": 120 })
  distribution: Record<number, number>
  // porcentagens por nota (opcional, em 0..100)
  percentages?: Record<number, number>
  // mediana e moda (opcionais)
  median?: number | null
  mode?: number | null
  // categorias NPS (quando escala 0..10)
  detractors?: number
  passives?: number
  promoters?: number
  // nps percentual (promoters% - detractors%)
  nps?: number
}

export interface EvaluationStatsFilters {
  from?: Date
  to?: Date
  minScore?: number
}

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
  abstract getEvaluationStats(
    professionalId: string,
    filters?: EvaluationStatsFilters,
  ): Promise<EvaluationStats>
}
