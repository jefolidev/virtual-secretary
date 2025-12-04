import { InMemoryOrganizationRepository } from '@test/repositories/in-memory-organization.repository'
import { FetchOrganizationUseCase } from './fetch-organization'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let sut: FetchOrganizationUseCase

describe('Fetch All Organizations', async () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    sut = new FetchOrganizationUseCase(inMemoryOrganizationRepository)
  })

  it('should be able to fetch all organizations', async () => {
    const response = await sut.execute()

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.organization).toEqual([])
      expect(response.value.organization).toHaveLength(0)
    }
  })
})
