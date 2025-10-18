import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { CancellationPolicyRepository } from '@src/domain/appointments/application/repositories/cancellation-policy.repository'
import type { CancellationPolicy } from '@src/domain/appointments/enterprise/entities/cancellation-policy'

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
}
