import { GetEvaluationStatsUseCase } from '@/domain/evaluation/application/use-case/get-evaluation-stats'
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { EvaluationStatsPresenter } from '../presenters/evaluation-stats-presenter'

const getEvaluationStatsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  minScore: z.coerce.number().min(0).max(10).optional(),
})

type GetEvaluationStatsQuerySchema = z.infer<
  typeof getEvaluationStatsQuerySchema
>

const queryValidationPipe = new ZodValidationPipe(getEvaluationStatsQuerySchema)

@Controller('/professionals/:professionalId/evaluations/stats')
export class GetEvaluationStatsController {
  constructor(private getEvaluationStats: GetEvaluationStatsUseCase) {}

  @Get()
  async handle(
    @Param('professionalId') professionalId: string,
    @Query(queryValidationPipe) query: GetEvaluationStatsQuerySchema,
  ) {
    const { from, to, minScore } = query

    const result = await this.getEvaluationStats.execute({
      professionalId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      minScore,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return {
      stats: EvaluationStatsPresenter.toHTTP(result.value.stats),
    }
  }
}
