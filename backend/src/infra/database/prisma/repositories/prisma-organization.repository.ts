import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { OrganizationRepository } from '@/domain/organization/application/repositories/organization.repository'
import { Organization } from '@/domain/organization/enterprise/entities/organization'

class PrismaOrganizationRepository implements OrganizationRepository {
  create(organization: Organization): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findById(id: UniqueEntityId): Promise<Organization | null> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<Organization[] | null> {
    throw new Error('Method not implemented.')
  }
  findByOwnerId(id: UniqueEntityId): Promise<Organization | null> {
    throw new Error('Method not implemented.')
  }
  save(organization: Organization): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
