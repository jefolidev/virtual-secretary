import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'

export interface CancellationPolicyRepository {
  create(cancellationPolicy: CancellationPolicy): Promise<void>
  findById(id: UniqueEntityId): Promise<CancellationPolicy | null>
  findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<CancellationPolicy | null>
}
