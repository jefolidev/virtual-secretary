import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '@/domain/scheduling/enterprise/entities/address'
import { Address as PrismaAddress } from '../../../generated/prisma'

export class PrismaAddressMapper {
  static toPrisma({
    addressLine1,
    addressLine2,
    city,
    country,
    organizationId,
    neighborhood,
    postalCode,
    state,
    id,
  }: Address): PrismaAddress {
    return {
      id: id.toString(),
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      country,
      neighborhood,
      postalCode,
      state,
      organizationId: organizationId || null,
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
      new UniqueEntityId(raw.id),
    )
  }
}
