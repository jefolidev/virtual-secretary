import { AddressRepository } from '@/domain/scheduling/application/repositories/address.repository'
import { Address } from '@/domain/scheduling/enterprise/entities/address'
import { Injectable } from '@nestjs/common'


export class InMemoryAddressRepository implements AddressRepository {
  public addresses: Address[] = []

  async create(address: Address): Promise<void> {
    this.addresses.push(address)
  }

  async save(address: Address): Promise<void> {
    const itemIndex = await this.addresses.findIndex(
      (item) => item.id === address.id
    )

    this.addresses[itemIndex] = address

    return Promise.resolve()
  }
}
