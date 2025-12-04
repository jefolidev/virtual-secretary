import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { makeOrganization } from '@test/factories/make-organization'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryOrganizationRepository } from '../../../../../test/repositories/in-memory-organization.repository'
import { UpdateOrganizationUseCase } from './update-organization'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: UpdateOrganizationUseCase

describe('Update Organization', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    sut = new UpdateOrganizationUseCase(
      inMemoryOrganizationRepository,
      inMemoryProfessionalRepository
    )
  })

  it('should be able to update a organization', async () => {
    const professional = makeProfessional()

    const organization = makeOrganization(
      {
        ownerId: professional.id,
      },
      new UniqueEntityId('organization-id')
    )

    await inMemoryOrganizationRepository.create(organization)
    await inMemoryProfessionalRepository.create(professional)

    const response = await sut.execute({
      name: 'Organization John Doe',
      organizationId: 'organization-id',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { organization } = response.value

      expect(organization.name).toBe('Organization John Doe')
      expect(organization.isActive).toBe(true)
      expect(organization.id.toString()).toBe('organization-id')
      expect(organization.slug.value).toBe('organization-john-doe')
    }
  })

  it('should not be able to update a organization if professional is not owner', async () => {
    const professional = makeProfessional()

    const organization = makeOrganization(
      {
        ownerId: new UniqueEntityId('owner-id-alt'),
      },
      new UniqueEntityId('organization-id')
    )

    await inMemoryOrganizationRepository.create(organization)
    await inMemoryProfessionalRepository.create(professional)

    const response = await sut.execute({
      name: 'Organization John Doe',
      organizationId: 'organization-id',
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotAllowedError)
    }
  })
})
