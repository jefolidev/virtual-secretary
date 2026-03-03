import { EvaluationStats } from '@/domain/evaluation/application/repositories/evaluation.repository'

export class EvaluationStatsPresenter {
  static toHTTP(stats: EvaluationStats) {
    return {
      averageScore: stats.averageScore,
      total: stats.total,
      distribution: stats.distribution,
      percentages: stats.percentages,
      median: stats.median,
      mode: stats.mode,
      detractors: stats.detractors,
      passives: stats.passives,
      promoters: stats.promoters,
      nps: stats.nps,
    }
  }
}
