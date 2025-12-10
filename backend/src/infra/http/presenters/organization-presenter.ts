import { Organization } from '@/domain/organization/enterprise/entities/organization'

export class OrganizationPresenter {
  static toHTTP(organization: Organization) {
    return {
      id: organization.id.toString(),
      ownerId: organization.ownerId.toString(),
      professionalsId: organization.professionalsIds,
      name: organization.name,
      cnpj: organization.cnpj,
      slug: organization.slug,
      isActive: organization.isActive,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    }
  }
}
