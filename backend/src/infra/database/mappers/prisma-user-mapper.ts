import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import {
  Address as PrismaAddress,
  User as PrismaUser,
} from '@prisma/generated/client'
import { UserUncheckedCreateInput } from '@prisma/generated/models'

export class PrismaUserMapper {
  static toPrisma(user: User): UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      cpf: user.cpf,
      phone: user.phone,
      clientId: user.clientId ? user.clientId.toString() : undefined,
      professionalId: user.professionalId
        ? user.professionalId.toString()
        : undefined,
      role: user.role,
    }
  }

  static toDomain(raw: PrismaUser & { address: PrismaAddress | null }): User {
    if (!raw.address) {
      throw new Error(
        `User com ID ${raw.id} não possui um endereço (Address) associado.`
      )
    }

    const address = {
      addressLine1: raw.address.addressLine1,
      addressLine2: raw.address.addressLine2 ?? undefined,
      neighborhood: raw.address.neighborhood,
      city: raw.address.city,
      state: raw.address.state,
      postalCode: raw.address.postalCode,
      country: raw.address.country,
    }

    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        phone: raw.phone,
        cpf: raw.cpf,
        clientId: raw.clientId ? new UniqueEntityId(raw.clientId) : undefined,
        professionalId: raw.professionalId
          ? new UniqueEntityId(raw.professionalId)
          : undefined,
        role: raw.role,
        address,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
