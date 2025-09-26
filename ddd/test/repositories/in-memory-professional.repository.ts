import type { Professional } from '@/domain/appointments/enterprise/entities/professional'
import type { ProfessionalRepository } from './../../src/domain/appointments/application/repositories/professional-repository'

export class InMemoryProfessionalRepository implements ProfessionalRepository {
  public items: Professional[] = []

  async create(professional: Professional): Promise<void> {
    await this.items.push(professional)
  }

  async findById(id: string): Promise<Professional | null> {
    const professional = await this.items.find(
      (professional) => professional.id.toString() === id
    )

    return professional ?? null
  }
  async save(professional: Professional): Promise<void> {
    const itemIndex = await this.items.findIndex(
      (item) => item.id === professional.id
    )

    this.items[itemIndex] = professional
  }
}
