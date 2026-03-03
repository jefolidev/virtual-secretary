import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Evaluation,
  EvaluationProps,
} from '@/domain/evaluation/enterprise/entities/evaluation'
import { faker } from '@faker-js/faker'

export function makeEvaluation(
  override: Partial<EvaluationProps> = {},
  id?: UniqueEntityId,
) {
  const evaluation = Evaluation.create(
    {
      appointmentId: new UniqueEntityId().toString(),
      professionalId: new UniqueEntityId().toString(),
      score: faker.number.int({ min: 0, max: 10 }),
      comment: faker.helpers.maybe(() => faker.lorem.sentence(), {
        probability: 0.7,
      }),
      createdAt: new Date(),
      ...override,
    },
    id,
  )

  return evaluation
}
