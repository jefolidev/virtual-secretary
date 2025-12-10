import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeOrganization } from '@test/factories/make-organization'
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
    const organization = makeOrganization(
      {},
      new UniqueEntityId('organization-id')
    )

    await inMemoryOrganizationRepository.create(organization)

    const response = await sut.execute({ organizationId: 'organization-id' })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.organization).toEqual(organization)
    }
  })
})
