import type { Organization } from '../../enterprise/entities/organization'

export interface OrganizationRepository {
  create(organization: Organization): Promise<void>
  findById(id: string): Promise<Organization | null>
  findMany(): Promise<Organization[] | null>
  findByOwnerId(id: string): Promise<Organization | null>
  save(organization: Organization): Promise<void>
}
