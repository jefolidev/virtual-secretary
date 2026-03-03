import { makeEvaluation } from '@test/factories/make-evaluation'
import { InMemoryEvaluationRepository } from '@test/repositories/in-memory-evaluation.repository'
import { GetEvaluationStatsUseCase } from './get-evaluation-stats'

let inMemoryEvaluationRepository: InMemoryEvaluationRepository
let sut: GetEvaluationStatsUseCase

describe('Get Evaluation Stats', () => {
  beforeEach(() => {
    inMemoryEvaluationRepository = new InMemoryEvaluationRepository()
    sut = new GetEvaluationStatsUseCase(inMemoryEvaluationRepository)
  })

  it('should be able to get evaluation stats', async () => {
    const professionalId = 'professional-1'

    // Criar avaliações variadas
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 10 }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 9 }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 9 }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 8 }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 7 }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 6 }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 5 }),
    )

    const result = await sut.execute({
      professionalId: professionalId.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.stats.total).toBe(7)
      expect(result.value.stats.averageScore).toBeCloseTo(7.71, 1)
      expect(result.value.stats.distribution).toEqual({
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 2,
        10: 1,
      })
      expect(result.value.stats.detractors).toBe(2) // 5, 6
      expect(result.value.stats.passives).toBe(2) // 7, 8
      expect(result.value.stats.promoters).toBe(3) // 9, 9, 10
      expect(result.value.stats.nps).toBeCloseTo(14.29, 1)
    }
  })

  it('should filter by date range', async () => {
    const professionalId = 'professional-1'
    const oldDate = new Date('2025-01-01')
    const recentDate = new Date('2026-03-01')

    await inMemoryEvaluationRepository.create(
      makeEvaluation({
        professionalId,
        score: 10,
        createdAt: oldDate,
      }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({
        professionalId,
        score: 5,
        createdAt: recentDate,
      }),
    )

    const result = await sut.execute({
      professionalId: professionalId.toString(),
      from: new Date('2026-01-01'),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.stats.total).toBe(1)
      expect(result.value.stats.averageScore).toBe(5)
    }
  })

  it('should filter by minimum score', async () => {
    const professionalId = 'professional-1'

    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 10 }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 8 }),
    )
    await inMemoryEvaluationRepository.create(
      makeEvaluation({ professionalId, score: 5 }),
    )

    const result = await sut.execute({
      professionalId: professionalId.toString(),
      minScore: 8,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.stats.total).toBe(2)
      expect(result.value.stats.averageScore).toBe(9)
    }
  })
})
