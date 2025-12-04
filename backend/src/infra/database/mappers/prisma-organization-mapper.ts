import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Organization } from '@/domain/organization/enterprise/entities/organization'
import { Slug } from '@/utils/slug'
import { Organization as PrismaOrganization } from '@prisma/generated/client'

export class PrismaOrganizationMapper {
  static toDomain(raw: PrismaOrganization): Organization {
    return Organization.create(
      {
        name: raw.name,
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
