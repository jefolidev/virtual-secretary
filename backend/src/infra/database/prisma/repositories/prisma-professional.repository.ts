import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'

class PrismaProfessionalRepository implements ProfessionalRepository {
  create(professional: Professional): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<Professional[]> {
    throw new Error('Method not implemented.')
  }
  findById(id: UniqueEntityId): Promise<Professional | null> {
    throw new Error('Method not implemented.')
  }
  assignCancellationPolicy(
    professionalId: string,
    cancellationPolicyId: string
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
  save(professional: Professional): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
