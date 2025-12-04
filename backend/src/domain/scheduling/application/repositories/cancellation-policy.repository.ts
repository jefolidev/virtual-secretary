import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'

export interface CancellationPolicyRepository {
  create(cancellationPolicy: CancellationPolicy): Promise<void>
  findById(id: UniqueEntityId): Promise<CancellationPolicy | null>
  findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<CancellationPolicy | null>
  save(cancellationPolicy: CancellationPolicy): Promise<void>
}
