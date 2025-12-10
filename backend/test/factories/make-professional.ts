import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Professional,
  type ProfessionalProps,
} from '@/domain/scheduling/enterprise/entities/professional'

export function makeProfessional(
  override?: Partial<ProfessionalProps>,
  id?: UniqueEntityId
) {
  const professional: Professional = Professional.create(
    {
      scheduleConfigurationId: new UniqueEntityId(),
      cancellationPolicyId: new UniqueEntityId(),
      sessionPrice: 2000,
      ...override,
    },
    id
  )

  return professional
}
