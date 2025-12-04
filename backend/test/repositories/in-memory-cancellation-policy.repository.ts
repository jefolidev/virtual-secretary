import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { CancellationPolicyRepository } from '@/domain/scheduling/application/repositories/cancellation-policy.repository'
import type { CancellationPolicy } from '@/domain/scheduling/enterprise/entities/cancellation-policy'

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

  async findByProfessionalId(
    professionalId: UniqueEntityId
  ): Promise<CancellationPolicy | null> {
    const cancellationPolicy = await this.items.find((cancellationPolicy) =>
      cancellationPolicy.professionalId.equals(professionalId)
    )

    return cancellationPolicy ?? null
  }

  async save(cancellationPolicy: CancellationPolicy): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === cancellationPolicy.id
    )

    this.items[itemIndex] = cancellationPolicy
  }
}
