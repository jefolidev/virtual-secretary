import type { Organization } from '../../enterprise/entities/organization'

export abstract class OrganizationRepository {
  abstract create(organization: Organization): Promise<void>
  abstract findById(id: string): Promise<Organization | null>
  abstract findMany(): Promise<Organization[] | null>
  abstract findByOwnerId(id: string): Promise<Organization | null>
  abstract save(organization: Organization): Promise<void>
}
