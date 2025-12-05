import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { User as PrismaUser } from '@prisma/generated/client'
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
      addressId: user.addressId ? user.addressId.toString() : undefined,
      clientId: user.clientId ? user.clientId.toString() : undefined,
      professionalId: user.professionalId
        ? user.professionalId.toString()
        : undefined,
      role: user.role,
    }
  }

  static toDomain(raw: PrismaUser): User {
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
        addressId: raw.addressId
          ? new UniqueEntityId(raw.addressId)
          : undefined,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
