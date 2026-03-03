import {
  EvaluationRepository,
  EvaluationStats,
  EvaluationStatsFilters,
} from '@/domain/evaluation/application/repositories/evaluation.repository'
import { Evaluation } from '@/domain/evaluation/enterprise/entities/evaluation'
import { Injectable } from '@nestjs/common'
import { PrismaEvaluationMapper } from '../../mappers/prisma-evaluation-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaEvaluationRepository implements EvaluationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(evaluation: Evaluation): Promise<void> {
    await this.prisma.evaluation.create({
      data: {
        id: evaluation.id.toString(),
        professionalId: evaluation.professionalId,
        appointmentId: evaluation.appointmentId,
        score: evaluation.score,
        comment: evaluation.comment,
        createdAt: evaluation.createdAt,
      },
    })
  }

  async findManyByProfessionalId(
    professionalId: string,
  ): Promise<Evaluation[] | null> {
    const evaluationsAboutTheProfessional =
      await this.prisma.evaluation.findMany({
        where: { professionalId },
      })

    if (!evaluationsAboutTheProfessional) return null

    return evaluationsAboutTheProfessional.map(PrismaEvaluationMapper.toDomain)
  }

  async findByAppointmentId(appointmentId: string): Promise<Evaluation | null> {
    const evaluation = await this.prisma.evaluation.findFirst({
      where: { appointmentId },
    })
    if (!evaluation) return null

    return PrismaEvaluationMapper.toDomain(evaluation)
  }

  async updateEvaluationComment(
    evaluationId: string,
    comment: string,
  ): Promise<void> {
    await this.prisma.evaluation.update({
      where: { id: evaluationId },
      data: { comment },
    })
  }

  async getEvaluationStats(
    professionalId: string,
    filters?: EvaluationStatsFilters,
  ): Promise<EvaluationStats> {
    // Buscar todas as avaliações do profissional com filtros
    const evaluations = await this.prisma.evaluation.findMany({
      where: {
        professionalId,
        ...(filters?.from && { createdAt: { gte: filters.from } }),
        ...(filters?.to && { createdAt: { lte: filters.to } }),
        ...(filters?.minScore && { score: { gte: filters.minScore } }),
      },
      select: {
        score: true,
      },
    })

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

    // Calcular moda (nota mais frequente)
    let mode: number | null = null
    let maxCount = 0
    for (const [score, count] of Object.entries(distribution)) {
      if (count > maxCount) {
        maxCount = count
        mode = Number(score)
      }
    }

    // Calcular categorias NPS (escala 0-10)
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
