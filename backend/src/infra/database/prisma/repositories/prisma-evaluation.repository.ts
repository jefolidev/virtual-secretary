import { EvaluationRepository } from '@/domain/evaluation/application/repositories/evaluation.repository'
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
}
