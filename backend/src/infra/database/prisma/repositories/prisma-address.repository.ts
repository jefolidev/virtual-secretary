import { AddressRepository } from '@/domain/scheduling/application/repositories/address.repository'
import { Address } from '@/domain/scheduling/enterprise/entities/address'
import { Injectable } from '@nestjs/common'
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
