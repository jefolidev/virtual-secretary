import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { Organization } from '../../enterprise/entities/organization'

export interface OrganizationRepository {
  create(organization: Organization): Promise<void>
  findById(id: UniqueEntityId): Promise<Organization | null>
  save(organization: Organization): Promise<void>
}
