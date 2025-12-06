import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'

import { Injectable } from '@nestjs/common'
import { PrismaProfessionalMapper } from '../../mappers/prisma-professional-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaProfessionalRepository implements ProfessionalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(professional: Professional): Promise<void> {
    await this.prisma.professional.create({
      data: {
        id: professional.id.toString(),
        organizationId: professional.organizationId
          ? professional.organizationId.toString()
          : null,
        sessionPrice: professional.sessionPrice as any,
        createdAt: professional.createdAt,
        updatedAt: professional.updatedAt ?? null,
      },
    })
  }
  findMany(): Promise<Professional[]> {
    throw new Error('Method not implemented.')
  }

  async findById(id: string): Promise<Professional | null> {
    const professional = await this.prisma.professional.findFirst({
      where: {
        id,
      },
      include: {
        user: true,
      },
    })

    if (!professional) {
      return null
    }

    return PrismaProfessionalMapper.toDomain(professional)
  }
  assignCancellationPolicy(
    professionalId: string,
    cancellationPolicyId: string
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
  save(professional: Professional): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
