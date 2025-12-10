import { makeClient } from '@test/factories/make-client'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { FetchClientsUseCase } from './fetch-client'

let inMemoryClientRepository: InMemoryClientRepository
let sut: FetchClientsUseCase

describe('Fetch Client', () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    sut = new FetchClientsUseCase(inMemoryClientRepository)
  })

  it('should be able to fetch a client', async () => {
    const client = makeClient()

    await inMemoryClientRepository.create(client)

    const response = await sut.execute({ page: 1 })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.clients).toHaveLength(1)
    }
  })
})
