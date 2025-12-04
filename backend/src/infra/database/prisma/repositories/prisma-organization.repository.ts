import { OrganizationRepository } from '@/domain/organization/application/repositories/organization.repository'
import { Organization } from '@/domain/organization/enterprise/entities/organization'
import { Injectable } from '@nestjs/common'

@Injectable({})
export class PrismaOrganizationRepository implements OrganizationRepository {
  create(organization: Organization): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findById(id: string): Promise<Organization | null> {
    throw new Error('Method not implemented.')
  }
  findMany(): Promise<Organization[] | null> {
    throw new Error('Method not implemented.')
  }
  findByOwnerId(id: string): Promise<Organization | null> {
    throw new Error('Method not implemented.')
  }
  save(organization: Organization): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
