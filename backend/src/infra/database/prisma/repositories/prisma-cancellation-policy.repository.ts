import { CancellationPolicyRepository } from '@/domain/scheduling/application/repositories/cancellation-policy.repository'
import { CancellationPolicy } from '@/domain/scheduling/enterprise/entities/cancellation-policy'
import { Injectable } from '@nestjs/common'
import { PrismaCancellationPolicyMapper } from '../../mappers/prisma-cancellation-policy-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCancellationPolicyRepository
  implements CancellationPolicyRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(cancellationPolicy: CancellationPolicy): Promise<void> {
    const rawData = PrismaCancellationPolicyMapper.toPrisma(cancellationPolicy)
    const data = {
      ...rawData,
      professionalId: rawData.professionalId
        ? rawData.professionalId.toString()
        : undefined,
    }
  
    await this.prisma.cancellationPolicy.create({
      data,
    })
  }

  async findById(id: string): Promise<CancellationPolicy | null> {
    const policy = await this.prisma.cancellationPolicy.findUnique({
      where: { id },
    })
    if (!policy) return null

    return PrismaCancellationPolicyMapper.toDomain(policy)
  }

  async findByProfessionalId(
    professionalId: string
  ): Promise<CancellationPolicy | null> {
    const policy = await this.prisma.cancellationPolicy.findFirst({
      where: { professionalId },
    })
    if (!policy) return null
    return PrismaCancellationPolicyMapper.toDomain(policy)
  }

  async save(cancellationPolicy: CancellationPolicy): Promise<void> {
    const rawData = PrismaCancellationPolicyMapper.toPrisma(cancellationPolicy)
    const data = {
      ...rawData,
      professionalId: rawData.professionalId
        ? rawData.professionalId.toString()
        : undefined,
    }

    await Promise.all([
      await this.prisma.cancellationPolicy.update({
        where: {
          id: cancellationPolicy.id.toString(),
        },
        data,
      }),
    ])
  }
}
