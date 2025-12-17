import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Professional } from '@/domain/scheduling/enterprise/entities/professional'
import { ProfessionalWithNotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/professional-with-notification-settings'
import type { ProfessionalRepository } from '../../src/domain/scheduling/application/repositories/professional.repository'

export class InMemoryProfessionalRepository implements ProfessionalRepository {
  public items: Professional[] = []

  async create(professional: Professional): Promise<void> {
    await this.items.push(professional)
  }

  async findMany(): Promise<Professional[]> {
    return (await this.items) ?? []
  }

  async findById(id: string): Promise<Professional | null> {
    const professional = await this.items.find(
      (professional) => professional.id.toString() === id
    )

    return professional ?? null
  }

  async findByUserId(id: string): Promise<Professional | null> {
    const professional = await this.items.find(
      (professional) =>
        professional.userId !== undefined &&
        professional.userId.equals(new UniqueEntityId(id))
    )

    return professional ?? null
  }

  async assignCancellationPolicy(
    professionalId: string,
    cancellationPolicyId: string
  ) {
    const item = await this.items.find(
      (item) => item.id?.toString() === professionalId
    )

    if (!item) {
      throw new Error('Professional not found.')
    }

    if (!item.cancellationPolicyId) {
      item.cancellationPolicyId = new UniqueEntityId(cancellationPolicyId)
    }
  }

  async findByProfessionalIdWithNotificationSettings(
    professionalId: string
  ): Promise<ProfessionalWithNotificationSettings> {
    const professional = this.items.find(
      (item) => item.id.toString() === professionalId
    )

    if (!professional) {
      throw new Error('Professional not found')
    }

    return {
      professionalId: professional.id,
      notificationSettings: professional.notificationSettings,
    } as ProfessionalWithNotificationSettings
  }

  async save(professional: Professional): Promise<void> {
    const itemIndex = await this.items.findIndex(
      (item) => item.id === professional.id
    )

    this.items[itemIndex] = professional
  }
}
