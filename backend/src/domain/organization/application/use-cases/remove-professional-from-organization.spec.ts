import { makeOrganization } from '@test/factories/make-organization'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryOrganizationRepository } from '../../../../../test/repositories/in-memory-organization.repository'
import { RemoveProfessionalFromOrganizationUseCase } from './remove-professional-from-organization'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: RemoveProfessionalFromOrganizationUseCase

describe('Remove Professional From Organization', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()

    sut = new RemoveProfessionalFromOrganizationUseCase(
      inMemoryOrganizationRepository,
      inMemoryProfessionalRepository
    )
  })

  it('should be able to remove a professional from an organization', async () => {
    const organization = makeOrganization()
    const professional = makeProfessional()

    await inMemoryOrganizationRepository.create(organization)
    await inMemoryProfessionalRepository.create(professional)

    const response = await sut.execute({
      organizationId: organization.id.toString(),
      professionalId: professional.id.toString(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { organization } = response.value

      expect(organization.professionalsIds).toHaveLength(0)
    }
  })
})
