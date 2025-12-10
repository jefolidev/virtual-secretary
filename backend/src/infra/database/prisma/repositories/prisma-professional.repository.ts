import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'

import { Injectable } from '@nestjs/common'
import { PrismaProfessionalMapper } from '../../mappers/prisma-professional-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaProfessionalRepository implements ProfessionalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(professional: Professional): Promise<void> {
    const data = PrismaProfessionalMapper.toPrisma(professional)

    await this.prisma.professional.create({
      data,
    })
  }

  async findMany(): Promise<Professional[]> {
    const professionals = await this.prisma.professional.findMany()

    return professionals.map(PrismaProfessionalMapper.toDomain)
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

  async findByUserId(id: string): Promise<Professional | null> {
    const professional = await this.prisma.professional.findFirst({
      where: {
        user: { id },
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

  async assignCancellationPolicy(
    professionalId: string,
    cancellationPolicyId: string
  ): Promise<void> {
    await this.prisma.professional.update({
      where: { id: professionalId },
      data: { cancellationPolicyId },
    })
  }

  async save(professional: Professional): Promise<void> {
    const data = PrismaProfessionalMapper.toPrisma(professional)

    await Promise.all([
      this.prisma.professional.update({
        where: { id: professional.id.toString() },
        data,
      }),
    ])
  }
}
