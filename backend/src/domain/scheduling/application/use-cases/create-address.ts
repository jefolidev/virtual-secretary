import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Address } from '../../enterprise/entities/address'
import { AddressRepository } from '../repositories/address.repository'

export interface CreateAddressUseCaseRequest {
  addressLine1: string
  addressLine2?: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type CreateAddresUseCaseResponse = Either<null, { address }>

@Injectable()
export class CreateAddressUseCase {
  constructor(private addressRepository: AddressRepository) {}

  async execute({
    addressLine1,
    addressLine2,
    neighborhood,
    city,
    state,
    postalCode,
    country,
  }: CreateAddressUseCaseRequest): Promise<CreateAddresUseCaseResponse> {
    const address = Address.create({
      addressLine1,
      addressLine2,
      neighborhood,
      city,
      state,
      postalCode,
      country,
    })

    await this.addressRepository.create(address)

    return right({ address })
  }
}
