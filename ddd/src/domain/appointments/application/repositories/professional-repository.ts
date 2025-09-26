import type { Professional } from '../../enterprise/entities/professional'

export interface ProfessionalRepository {
  create(professional: Professional): Promise<void>
  findById(id: string): Promise<Professional | null>
  save(professional: Professional): Promise<void>
}
