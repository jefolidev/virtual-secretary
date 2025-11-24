import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import { makeOrganization } from '@test/factories/make-organization'
import { InMemoryOrganizationRepository } from '@test/repositories/in-memory-organization.repository'
import { UpdateOrganizationOwnerUseCase } from './update-organization-owner'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let sut: UpdateOrganizationOwnerUseCase

describe('Update Organization Owner', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    sut = new UpdateOrganizationOwnerUseCase(inMemoryOrganizationRepository)
  })

  it('should be able to update organization owner', async () => {
    const currentOwnerId = 'current-owner-123'
    const organization = makeOrganization({
      ownerId: new UniqueEntityId(currentOwnerId),
    })

    await inMemoryOrganizationRepository.create(organization)

    const newOwnerId = 'new-owner-456'

    const response = await sut.execute({
      currentOwnerId,
      newOwnerId,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { organization: updatedOrganization } = response.value

      expect(updatedOrganization.ownerId.toString()).toBe(newOwnerId)
      expect(updatedOrganization.ownerId.toString()).not.toBe(currentOwnerId)
    }
  })

  it('should not be able to update organization with non-existent current owner', async () => {
    const response = await sut.execute({
      currentOwnerId: 'non-existent-owner',
      newOwnerId: 'new-owner-456',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NotFoundError)
  })
})
