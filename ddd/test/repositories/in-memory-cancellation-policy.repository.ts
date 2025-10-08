import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { CancellationPolicyRepository } from '@/domain/appointments/application/repositories/cancellation-policy.repository'
import type { CancellationPolicy } from '@/domain/appointments/enterprise/entities/cancellation-policy'

export class InMemoryCancellationPolicyRepository
  implements CancellationPolicyRepository
{
  public items: CancellationPolicy[] = []

  async create(cancellationPolicy: CancellationPolicy): Promise<void> {
    await this.items.push(cancellationPolicy)
  }

  async findById(id: UniqueEntityId): Promise<CancellationPolicy | null> {
    const cancellationPolicy = await this.items.find((cancellationPolicy) =>
      cancellationPolicy.id.equals(id)
    )

    return cancellationPolicy ?? null
  }
}
