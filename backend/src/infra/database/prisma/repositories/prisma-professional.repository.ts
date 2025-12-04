import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'

import { Injectable } from '@nestjs/common'
import { PrismaProfessionalMapper } from '../../mappers/prisma-professional-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaProfessionalRepository implements ProfessionalRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(professional: Professional): Promise<void> {
    throw new Error('Method not implemented.')
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
        users: true,
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
