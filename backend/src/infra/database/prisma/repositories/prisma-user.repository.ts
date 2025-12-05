import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.')
  }
  create(user: User): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
