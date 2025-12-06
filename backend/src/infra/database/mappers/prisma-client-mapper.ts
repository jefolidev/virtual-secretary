import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Client } from '@/domain/scheduling/enterprise/entities/client'
import { Client as PrismaClientUser } from '@prisma/generated/client'

export class PrismaClientMapper {
  static toPrisma(client: Client): PrismaClientUser {
    return {
      id: client.id.toString(),
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      extraPreference: client.extraPreferences,
      periodPreference: client.periodPreference,
    }
  }

  static toDomain(raw: PrismaClientUser): Client {
    return Client.create(
      {
        appointmentHistory: [],
        extraPreferences: raw.extraPreference || null,
        periodPreference: raw.periodPreference || [],
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt || null,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
