import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CancellationPolicyRepository } from '@/domain/scheduling/application/repositories/cancellation-policy.repository'
import { CancellationPolicy } from '@/domain/scheduling/enterprise/entities/cancellation-policy'

class PrismaCancellationPolicyRepository
  implements CancellationPolicyRepository
{
  create(cancellationPolicy: CancellationPolicy): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findById(id: UniqueEntityId): Promise<CancellationPolicy | null> {
    throw new Error('Method not implemented.')
  }
  findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<CancellationPolicy | null> {
    throw new Error('Method not implemented.')
  }
  save(cancellationPolicy: CancellationPolicy): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
