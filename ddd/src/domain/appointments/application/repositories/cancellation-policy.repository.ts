import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'

export interface CancellationPolicyRepository {
  create(cancellationPolicy: CancellationPolicy): Promise<void>
  findById(id: UniqueEntityId): Promise<CancellationPolicy | null>
}
