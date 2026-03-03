import {
  EvaluationRepository,
  EvaluationStats,
  EvaluationStatsFilters,
} from '@/domain/evaluation/application/repositories/evaluation.repository'
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

  async getEvaluationStats(
    professionalId: string,
    filters?: EvaluationStatsFilters,
  ): Promise<EvaluationStats> {
    let evaluations = this.items.filter(
      (item) => item.professionalId.toString() === professionalId,
    )

    // Aplicar filtros
    if (filters?.from) {
      evaluations = evaluations.filter(
        (item) => item.createdAt >= filters.from!,
      )
    }

    if (filters?.to) {
      evaluations = evaluations.filter((item) => item.createdAt <= filters.to!)
    }

    if (filters?.minScore) {
      evaluations = evaluations.filter(
        (item) => item.score >= filters.minScore!,
      )
    }

    if (filters?.minScore !== undefined) {
      evaluations = evaluations.filter(
        (item) => item.score >= filters.minScore!,
      )
    }

    const total = evaluations.length

    if (total === 0) {
      return {
        averageScore: 0,
        total: 0,
        distribution: {},
        percentages: {},
        median: null,
        mode: null,
        detractors: 0,
        passives: 0,
        promoters: 0,
        nps: 0,
      }
    }

    // Calcular distribuição
    const distribution: Record<number, number> = {}
    let sum = 0

    for (const evaluation of evaluations) {
      const score = evaluation.score
      sum += score
      distribution[score] = (distribution[score] || 0) + 1
    }

    // Calcular average
    const averageScore = sum / total

    // Calcular percentages
    const percentages: Record<number, number> = {}
    for (const [score, count] of Object.entries(distribution)) {
      percentages[Number(score)] = (count / total) * 100
    }

    // Calcular mediana
    const sortedScores = evaluations.map((e) => e.score).sort((a, b) => a - b)
    const median =
      total % 2 === 0
        ? (sortedScores[total / 2 - 1] + sortedScores[total / 2]) / 2
        : sortedScores[Math.floor(total / 2)]

    // Calcular moda
    let mode: number | null = null
    let maxCount = 0
    for (const [score, count] of Object.entries(distribution)) {
      if (count > maxCount) {
        maxCount = count
        mode = Number(score)
      }
    }

    // Calcular categorias NPS
    const detractors = evaluations.filter((e) => e.score <= 6).length
    const passives = evaluations.filter(
      (e) => e.score === 7 || e.score === 8,
    ).length
    const promoters = evaluations.filter((e) => e.score >= 9).length

    // Calcular NPS percentual
    const promotersPercent = (promoters / total) * 100
    const detractorsPercent = (detractors / total) * 100
    const nps = promotersPercent - detractorsPercent

    return {
      averageScore: Number(averageScore.toFixed(2)),
      total,
      distribution,
      percentages,
      median: Number(median.toFixed(2)),
      mode,
      detractors,
      passives,
      promoters,
      nps: Number(nps.toFixed(2)),
    }
  }
}
