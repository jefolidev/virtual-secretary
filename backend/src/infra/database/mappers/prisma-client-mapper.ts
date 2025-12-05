import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Client } from '@/domain/scheduling/enterprise/entities/client'
import {
  Client as PrismaClientUser,
  User as PrismaUser,
} from '@prisma/generated/client'

type PrismaClientWithUser = PrismaClientUser & {
  users: PrismaUser | null
}

export class PrismaClientMapper {
  static toDomain(raw: PrismaClientWithUser): Client {
    if (!raw.users) {
      throw new Error(
        `Client com ID ${raw.id} não possui um usuário (User) associado.`
      )
    }

    return Client.create(
      {
        name: raw.users.name,
        phone: raw.users.phone,
        createdAt: raw.createdAt,
        extraPreferences: raw.extraPreference || null,
        periodPreference: raw.periodPreference || [],
        updatedAt: raw.updatedAt || null,
        appointmentHistory: [],
      },
      new UniqueEntityId(raw.id)
    )
  }
}
