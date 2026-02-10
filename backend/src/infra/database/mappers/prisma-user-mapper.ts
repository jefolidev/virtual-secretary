import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { User as PrismaUser } from '@prisma/client'

export class PrismaUserMapper {
  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      gender: user.gender,
      birthDate: user.birthDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt ?? null,
      cpf: user.cpf,
      whatsappNumber: user.whatsappNumber,
      addressId: user.addressId ? user.addressId.toString() : null,
      clientId: user.clientId ? user.clientId.toString() : null,
      professionalId: user.professionalId
        ? user.professionalId.toString()
        : null,
      threadId: null, // ajuste conforme necessário
      role: user.role,
    }
  }

  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        gender: raw.gender,
        birthDate: raw.birthDate,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        whatsappNumber: raw.whatsappNumber,
        cpf: raw.cpf,
        clientId: raw.clientId ? new UniqueEntityId(raw.clientId) : undefined,
        professionalId: raw.professionalId
          ? new UniqueEntityId(raw.professionalId)
          : undefined,
        role: raw.role,
        addressId: raw.addressId
          ? new UniqueEntityId(raw.addressId)
          : undefined,
      },
      new UniqueEntityId(raw.id),
    )
  }
}
