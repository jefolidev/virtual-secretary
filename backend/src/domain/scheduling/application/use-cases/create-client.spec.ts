import { faker } from '@faker-js/faker'
import { InMemoryClientRepository } from '../../../../../test/repositories/in-memory-client.repository'
import { CreateClientUseCase } from './create-client'

let inMemoryClientRepository: InMemoryClientRepository
let sut: CreateClientUseCase

describe('Create Client', () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    sut = new CreateClientUseCase(inMemoryClientRepository)
  })

  it('should be able to create a client', async () => {
    const response = await sut.execute({
      name: 'John Doe',
      phone: faker.phone.number(),
      extraPreferences: 'Nenhuma',
      periodPreference: ['AFTERNOON'],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { client } = response.value

      expect(client.name).toBe('John Doe')
      expect(client.extraPreferences).toBe('Nenhuma')
      expect(client.periodPreference).toEqual(['AFTERNOON'])
    }
  })
})
