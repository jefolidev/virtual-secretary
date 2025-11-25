import { InMemoryOrganizationRepository } from '@test/repositories/in-memory-organization.repository'
import { FetchOrganizationByIdUseCase } from './fetch-organization-by-id'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let sut: FetchOrganizationByIdUseCase

describe('Fetch Organizations By Id', async () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    sut = new FetchOrganizationByIdUseCase(inMemoryOrganizationRepository)
  })

  it('should be able to fetch all organizations', async () => {
    const response = await sut.execute({ organizationId: 'organization-id' })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.organization).toEqual(null)
    }
  })
})
