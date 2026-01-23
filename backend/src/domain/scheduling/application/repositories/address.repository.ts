import type { Address } from '../../enterprise/entities/address'

export abstract class AddressRepository {
  abstract create(address: Address): Promise<void>
  abstract save(address: Address): Promise<void>
  abstract getFullAddress(
    postalCode: string,
    number: string,
    complement?: string,
  ): Promise<Address>
}
