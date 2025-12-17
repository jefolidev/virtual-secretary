import { PaginationParams } from '@/core/repositories/pagination-params'
import { Professional } from '../../enterprise/entities/professional'
import { ProfessionalWithNotificationSettings } from '../../enterprise/entities/value-objects/professional-with-notification-settings'

export abstract class ProfessionalRepository {
  abstract create(professional: Professional): Promise<void>
  abstract findMany(params?: PaginationParams): Promise<Professional[]>
  abstract findById(id: string): Promise<Professional | null>
  abstract findByUserId(id: string): Promise<Professional | null>
  abstract findByProfessionalIdWithNotificationSettings(
    professionalId: string
  ): Promise<ProfessionalWithNotificationSettings | null>
  abstract assignCancellationPolicy(
    professionalId: string,
    cancellationPolicyId: string
  ): Promise<void>
  abstract save(professional: Professional): Promise<void>
}
