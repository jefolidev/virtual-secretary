import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import {
  EvaluationRepository,
  EvaluationStats,
} from '../repositories/evaluation.repository'

interface GetEvaluationStatsUseCaseRequest {
  professionalId: string
  from?: Date
  to?: Date
  minScore?: number
}

type GetEvaluationStatsUseCaseResponse = Either<
  NotFoundError,
  {
    stats: EvaluationStats
  }
>

@Injectable()
export class GetEvaluationStatsUseCase {
  constructor(private evaluationRepository: EvaluationRepository) {}

  async execute({
    professionalId,
    from,
    to,
    minScore,
  }: GetEvaluationStatsUseCaseRequest): Promise<GetEvaluationStatsUseCaseResponse> {
    const stats = await this.evaluationRepository.getEvaluationStats(
      professionalId,
      {
        from,
        to,
        minScore,
      },
    )

    if (!stats || stats.total === 0) {
      return left(new NotFoundError())
    }

    return right({
      stats,
    })
  }
}
