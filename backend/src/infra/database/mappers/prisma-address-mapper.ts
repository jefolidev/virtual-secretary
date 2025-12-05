import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '@/domain/scheduling/enterprise/entities/address'
import { Address as PrismaAddress } from '@prisma/generated/client'
import { AddressUncheckedCreateInput } from '@prisma/generated/models'

export class PrismaAddressMapper {
  static toPrisma({
    addressLine1,
    addressLine2,
    city,
    country,
    neighborhood,
    postalCode,
    state,
    id,
  }: Address): AddressUncheckedCreateInput {
    return {
      id: id.toString(),
      addressLine1,
      addressLine2,
      city,
      country,
      neighborhood,
      postalCode,
      state,
    }
  }

  static toDomain(raw: PrismaAddress): Address {
    return Address.create(
      {
        addressLine1: raw.addressLine1,
        addressLine2: raw.addressLine2 ? raw.addressLine2 : null,
        city: raw.city,
        country: raw.country,
        neighborhood: raw.neighborhood,
        postalCode: raw.postalCode,
        state: raw.state,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
