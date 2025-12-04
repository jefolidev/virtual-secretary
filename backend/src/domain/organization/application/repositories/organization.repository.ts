import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Organization } from '../../enterprise/entities/organization'

export interface OrganizationRepository {
  create(organization: Organization): Promise<void>
  findById(id: UniqueEntityId): Promise<Organization | null>
  findMany(): Promise<Organization[] | null>
  findByOwnerId(id: UniqueEntityId): Promise<Organization | null>
  save(organization: Organization): Promise<void>
}
