import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeAddress } from '@test/factories/make-address'
import { InMemoryAddressRepository } from '@test/repositories/in-memory-address.repository'
import { InMemoryCancellationPolicyRepository } from '@test/repositories/in-memory-cancellation-policy.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { RegisterUserUseCase } from './register-user'

let inMemoryUsersRepository: InMemoryUserRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryAddressRepository: InMemoryAddressRepository
let inMemoryCancellationPolicyRepository: InMemoryCancellationPolicyRepository
let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository
let fakeHasher: FakeHasher

let sut: RegisterUserUseCase

describe('Register User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryAddressRepository = new InMemoryAddressRepository()
    inMemoryCancellationPolicyRepository =
      new InMemoryCancellationPolicyRepository()
    inMemoryScheduleConfigurationRepository =
      new InMemoryScheduleConfigurationRepository()

    sut = new RegisterUserUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      inMemoryClientRepository,
      inMemoryProfessionalRepository,
      inMemoryAddressRepository,
      inMemoryCancellationPolicyRepository,
      inMemoryScheduleConfigurationRepository
    )
  })

  it('should be able to register a new user as client', async () => {
    const address = makeAddress()
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'JohnDoe123',
      address,
      cpf: '07609254371',
      phone: '85987146194',
      gender: 'MALE',
      birthDate: new Date('1990-01-01'),
      role: 'CLIENT',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      user: inMemoryUsersRepository.items[0],
    })

    expect(inMemoryUsersRepository.items[0].role).toBe('CLIENT')
    expect(inMemoryUsersRepository.items[0].clientId).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].addressId).toBeTruthy()

    expect(inMemoryUsersRepository.items[0].professionalId).toBeUndefined()
  })

  it('should be able to register a new user as professional', async () => {
    const address = makeAddress()

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'JohnDoe123',
      address,
      cpf: '07609254371',
      phone: '85987146194',
      gender: 'MALE',
      birthDate: new Date('1990-01-01'),
      role: 'PROFESSIONAL',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      user: inMemoryUsersRepository.items[0],
    })
    expect(inMemoryUsersRepository.items[0].role).toBe('PROFESSIONAL')
    expect(inMemoryUsersRepository.items[0].clientId).toBeUndefined()
    expect(inMemoryUsersRepository.items[0].professionalId).toBeTruthy()
  })

  it('should hash user password upon registration', async () => {
    const address = makeAddress()

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'JohnDoe123',
      cpf: '07609254371',
      phone: '85987146194',
      gender: 'MALE',
      birthDate: new Date('1990-01-01'),
      role: 'PROFESSIONAL',
      address,
    })

    const hashedPassword = await fakeHasher.hash('JohnDoe123')

    expect(result.isRight()).toBe(true)
    expect(inMemoryUsersRepository.items[0].password).toEqual(hashedPassword)
  })
})
