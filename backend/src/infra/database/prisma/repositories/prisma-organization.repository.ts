import { OrganizationRepository } from '@/domain/organization/application/repositories/organization.repository'
import { Organization } from '@/domain/organization/enterprise/entities/organization'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { PrismaOrganizationMapper } from '../../mappers/prisma-organization-mapper'

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(organization: Organization): Promise<void> {
    const data = PrismaOrganizationMapper.toPrisma(organization)

    await this.prisma.organization.create({
      data,
    })
  }

  async findById(id: string): Promise<Organization | null> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { professionals: true },
    })

    if (!org) return null
    return PrismaOrganizationMapper.toDomain(org)
  }

  async findMany(): Promise<Organization[] | null> {
    const orgs = await this.prisma.organization.findMany({
      include: { professionals: true },
    })
    if (!orgs.length) return null
    return orgs.map((org) => PrismaOrganizationMapper.toDomain(org))
  }

  async findByOwnerId(ownerId: string): Promise<Organization | null> {
    const org = await this.prisma.organization.findFirst({
      where: { ownerId },
      include: { professionals: true },
    })
    if (!org) return null
    return PrismaOrganizationMapper.toDomain(org)
  }

  async save(organization: Organization): Promise<void> {
    const data = PrismaOrganizationMapper.toPrisma(organization)

    await this.prisma.organization.update({
      where: { id: organization.id.toString() },
      data,
    })
  }
}
