import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Organization } from '@/domain/organization/enterprise/entities/organization'
import { ProfessionalIdList } from '@/domain/organization/enterprise/value-objects/professional-id-list'
import { Slug } from '@/utils/slug'
import {
  Organization as PrismaOrganization,
  Professional,
} from '@prisma/generated/client'

type PrismaOrganizationWithProfessionals = PrismaOrganization & {
  professionals: Professional[]
}

export class PrismaOrganizationMapper {
  static toPrisma(organization: Organization): PrismaOrganization {
    if (!organization.addressId) {
      throw new Error(
        'Organization must have an addressId to be mapped to Prisma.'
      )
    }

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

  static toDomain(raw: PrismaOrganizationWithProfessionals): Organization {
    const professionalsIds = new ProfessionalIdList(
      raw.professionals?.map(
        (professional) => new UniqueEntityId(professional.id)
      ) || []
    )

    return Organization.create(
      {
        name: raw.name,
        addressId: new UniqueEntityId(raw.addressId),
        ownerId: new UniqueEntityId(raw.ownerId),
        isActive: raw.isActive,
        cnpj: raw.cnpj,
        slug: Slug.create(raw.slug),
        professionalsIds,
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
