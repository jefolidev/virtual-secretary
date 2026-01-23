import { AddressRepository } from '@/domain/scheduling/application/repositories/address.repository'
import { Address } from '@/domain/scheduling/enterprise/entities/address'
import { Injectable } from '@nestjs/common'
import cep from 'cep-promise'
import { PrismaAddressMapper } from '../../mappers/prisma-address-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(address: Address): Promise<void> {
    const data = PrismaAddressMapper.toPrisma(address)

    await this.prisma.address.create({
      data,
    })
  }
  async getFullAddress(
    postalCode: string,
    number: string,
    complement?: string,
  ): Promise<Address> {
    const {
      cep: postalCodeFromCep,
      city,
      neighborhood,
      state,
      service,
      street,
    } = await cep(postalCode)

    const data = {
      city,
      addressLine1: street + (number ? ', ' + number : ''),
      addressLine2: complement,
      neighborhood,
      postalCode: postalCodeFromCep,
      state,
      country: 'Brazil',
    }

    await this.prisma.address.create({
      data,
    })

    return data as Address
  }

  async save(address: Address): Promise<void> {
    const data = PrismaAddressMapper.toPrisma(address)

    await Promise.all([
      this.prisma.address.update({
        where: {
          id: address.id.toString(),
        },
        data,
      }),
    ])
  }
}
