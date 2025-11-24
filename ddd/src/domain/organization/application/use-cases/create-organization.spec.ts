import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryOrganizationRepository } from '../../../../../test/repositories/in-memory-organization.repository'
import { CreateOrganizationUseCase } from './create-organization'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: CreateOrganizationUseCase

describe('Create Organization', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    sut = new CreateOrganizationUseCase(
      inMemoryProfessionalRepository,
      inMemoryOrganizationRepository
    )
  })

  it('should be able to create a organization', async () => {
    const response = await sut.execute({
      name: 'Organization John Doe',
      ownerId: 'organization-id',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { organization } = response.value

      expect(organization.name).toBe('Organization John Doe')
      expect(organization.isActive).toBe(true)
      expect(organization.ownerId.toString()).toBe('organization-id')
      expect(organization.slug.value).toBe('organization-john-doe')
    }
  })
})
