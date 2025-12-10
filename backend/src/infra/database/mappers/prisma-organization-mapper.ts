import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Organization } from '@/domain/organization/enterprise/entities/organization'
import { Slug } from '@/utils/slug'
import { Organization as PrismaOrganization } from '@prisma/generated/client'

export class PrismaOrganizationMapper {
  static toPrisma(organization: Organization): PrismaOrganization {
    return {
      id: organization.id.toString(),
      name: organization.name,
      ownerId: organization.ownerId.toString(),
      isActive: organization.isActive,
      cnpj: organization.cnpj,
      slug: organization.slug.value,
      addressId: organization.addressId.toString(),
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    }
  }

  static toDomain(raw: PrismaOrganization): Organization {
    return Organization.create(
      {
        name: raw.name,
        addressId: new UniqueEntityId(raw.addressId),
        ownerId: new UniqueEntityId(raw.ownerId),
        isActive: raw.isActive,
        cnpj: raw.cnpj,
        slug: Slug.create(raw.slug),
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
