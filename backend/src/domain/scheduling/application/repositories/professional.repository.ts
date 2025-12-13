import { PaginationParams } from '@/core/repositories/pagination-params'
import { Professional } from '../../enterprise/entities/professional'

export abstract class ProfessionalRepository {
  abstract create(professional: Professional): Promise<void>
  abstract findMany(params?: PaginationParams): Promise<Professional[]>
  abstract findById(id: string): Promise<Professional | null>
  abstract findByUserId(id: string): Promise<Professional | null>
  abstract assignCancellationPolicy(
    professionalId: string,
    cancellationPolicyId: string
  ): Promise<void>
  abstract save(professional: Professional): Promise<void>
}
