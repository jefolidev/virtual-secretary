import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { PaginationParams } from '@/core/repositories/pagination-params'
import type { Professional } from '@/domain/scheduling/enterprise/entities/professional'
import { ProfessionalWithNotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/professional-with-notification-settings'
import { UserProfessionalWithSettings } from '@/domain/scheduling/enterprise/entities/value-objects/user-professional-with-settings'
import type { ProfessionalRepository } from '../../src/domain/scheduling/application/repositories/professional.repository'

export class InMemoryProfessionalRepository implements ProfessionalRepository {
  async findByProfessionalIdWithSettings(
    professionalId: string
  ): Promise<UserProfessionalWithSettings | null> {
    // This method should return a mock UserProfessionalWithSettings
    // In a real implementation, this would combine professional, user, and settings data
    // For testing purposes, we'll return null or create a mock implementation
    return null
  }

  async findManyProfessionalsAndSettings(
    params?: PaginationParams
  ): Promise<UserProfessionalWithSettings[] | null> {
    // This method should return an array of UserProfessionalWithSettings
    // For testing purposes, we'll return an empty array
    return []
  }
  public items: Professional[] = []

  async create(professional: Professional): Promise<void> {
    await this.items.push(professional)
  }

  async findMany(params?: PaginationParams): Promise<Professional[]> {
    let result = this.items

    if (params) {
      const start = (params.page - 1) * 20
      const end = start + 20
      result = this.items.slice(start, end)
    }

    return result
  }

  async findById(id: string): Promise<Professional | null> {
    const professional = this.items.find(
      (professional) => professional.id.toString() === id
    )

    return professional ?? null
  }

  async findByUserId(id: string): Promise<Professional | null> {
    const professional = this.items.find(
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
