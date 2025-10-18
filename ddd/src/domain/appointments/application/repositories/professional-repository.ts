import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { Professional } from '../../enterprise/entities/professional'

export interface ProfessionalRepository {
  create(professional: Professional): Promise<void>
  findMany(): Promise<Professional[]>
  findById(id: UniqueEntityId): Promise<Professional | null>
  assignCancellationPolicy(
    professionalId: string,
    cancellationPolicyId: string
  ): Promise<void>
  save(professional: Professional): Promise<void>
}
