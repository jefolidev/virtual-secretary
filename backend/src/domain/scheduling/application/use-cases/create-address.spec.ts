import { InMemoryAddressRepository } from '@test/repositories/in-memory-address.repository'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateAddressUseCase } from './create-address'

describe('CreateAddressUseCase', () => {
  let addressRepository: InMemoryAddressRepository
  let createAddressUseCase: CreateAddressUseCase

  beforeEach(() => {
    addressRepository = new InMemoryAddressRepository()
    createAddressUseCase = new CreateAddressUseCase(addressRepository)
  })

  it('should create an address with all required fields', async () => {
    const result = await createAddressUseCase.execute({
      addressLine1: '123 Main St',
      neighborhood: 'Downtown',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '12345',
      country: 'USA',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { address } = result.value
      expect(address.addressLine1).toBe('123 Main St')
      expect(address.neighborhood).toBe('Downtown')
      expect(address.city).toBe('Metropolis')
      expect(address.state).toBe('NY')
      expect(address.postalCode).toBe('12345')
      expect(address.country).toBe('USA')
      expect(address.addressLine2).toBeUndefined()
    }
    expect(addressRepository.addresses.length).toBe(1)
  })

  it('should create an address with optional addressLine2', async () => {
    const result = await createAddressUseCase.execute({
      addressLine1: '456 Elm St',
      addressLine2: 'Apt 7B',
      neighborhood: 'Uptown',
      city: 'Gotham',
      state: 'CA',
      postalCode: '67890',
      country: 'USA',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { address } = result.value
      expect(address.addressLine2).toBe('Apt 7B')
    }
    expect(addressRepository.addresses.length).toBe(1)
  })

  it('should call repository create method', async () => {
    const spy = vi.spyOn(addressRepository, 'create')
    await createAddressUseCase.execute({
      addressLine1: '789 Oak St',
      neighborhood: 'Midtown',
      city: 'Star City',
      state: 'TX',
      postalCode: '54321',
      country: 'USA',
    })
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
