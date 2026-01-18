import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeAddress } from '@test/factories/make-address'
import { makeClient } from '@test/factories/make-client'
import { InMemoryAddressRepository } from '@test/repositories/in-memory-address.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { FakeThreadGenerator } from '@test/webhooks/openai/fake-thread-generator'
import { CreateClientByWhatsappUseCase } from './create-client-by-whatsapp'
let inMemoryUsersRepository: InMemoryUserRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryAddressRepository: InMemoryAddressRepository
let fakeHasher: FakeHasher
let fakeThread: FakeThreadGenerator

let sut: CreateClientByWhatsappUseCase

describe('Create Client', () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryAddressRepository = new InMemoryAddressRepository()
    inMemoryUsersRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()
    fakeThread = new FakeThreadGenerator()

    sut = new CreateClientByWhatsappUseCase(
      inMemoryClientRepository,
      inMemoryAddressRepository,
      inMemoryUsersRepository,
      fakeHasher,
      fakeThread,
    )
  })

  it('should be able to create a client by whatsapp', async () => {
    const client = makeClient()
    const address = makeAddress()

    await inMemoryClientRepository.create(client)
    await inMemoryAddressRepository.create(address)

    const response = await sut.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      whatsappNumber: '+1234567890',
      cpf: '123.456.789-00',
      gender: 'MALE',
      birthDate: new Date('1990-01-01'),
      clientData: {
        periodPreference: ['AFTERNOON'],
        extraPreferences: 'Nenhuma',
      },

      address,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { threadId } = response.value

      expect(threadId).toBeDefined()
    }
  })
})
