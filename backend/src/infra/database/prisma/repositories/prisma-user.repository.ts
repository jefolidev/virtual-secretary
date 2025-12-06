import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { Injectable } from '@nestjs/common'
import { PrismaUserMapper } from '../../mappers/prisma-user-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        address: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async resetPassword(userId: string, password: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
      },
    })
  }

  async create(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await this.prisma.user.create({
      data,
    })
  }
}
