import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { Client } from '@/domain/scheduling/enterprise/entities/client'
import { Injectable } from '@nestjs/common'
import { PrismaClientMapper } from '../../mappers/prisma-client-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(client: Client): Promise<void> {
    await this.prisma.client.create({
      data: {
        id: client.id.toString(),
        periodPreference: client.periodPreference ?? [],
        extraPreference: client.extraPreferences
          ? client.extraPreferences
          : null,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt ?? null,
      },
    })
  }

  findMany(): Promise<Client[]> {
    throw new Error('Method not implemented.')
  }

  async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
      },
      include: {
        users: true,
      },
    })

    if (!client) {
      return null
    }

    return PrismaClientMapper.toDomain(client)
  }

  async findByUserId(userId: string): Promise<Client | null> {
    const client = await this.prisma.client.findFirst({
      where: {
        users: {
          id: userId,
        },
      },
      include: {
        users: true,
      },
    })

    if (!client) {
      return null
    }

    return PrismaClientMapper.toDomain(client)
  }

  save(client: Client): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
