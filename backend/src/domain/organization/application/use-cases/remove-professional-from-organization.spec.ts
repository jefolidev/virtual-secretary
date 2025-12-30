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
    const professional = makeProfessional()
    const organization = makeOrganization()

    await inMemoryProfessionalRepository.create(professional)
    await inMemoryOrganizationRepository.create(organization)

    // Add professional to organization first
    organization.addProfessional(professional.id)
    professional.organizationId = organization.id
    await inMemoryOrganizationRepository.save(organization)
    await inMemoryProfessionalRepository.save(professional)

    const response = await sut.execute({
      organizationId: organization.id.toString(),
      professionalId: professional.id.toString(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { organization: updatedOrganization } = response.value

      expect(updatedOrganization.professionalsIds).toHaveLength(0)
      expect(updatedOrganization.professionalsIds).not.toContainEqual(
        professional.id
      )
    }

    // Check that professional's organizationId is cleared
    const updatedProfessional = await inMemoryProfessionalRepository.findById(
      professional.id.toString()
    )
    expect(updatedProfessional?.organizationId).toBeNull()
  })

  it('should not be able to remove a professional from a non-existent organization', async () => {
    const professional = makeProfessional()
    await inMemoryProfessionalRepository.create(professional)

    const response = await sut.execute({
      organizationId: 'non-existent-id',
      professionalId: professional.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(Error)
  })

  it('should not be able to remove a non-existent professional', async () => {
    const organization = makeOrganization()
    await inMemoryOrganizationRepository.create(organization)

    const response = await sut.execute({
      organizationId: organization.id.toString(),
      professionalId: 'non-existent-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(Error)
  })

  it('should not be able to remove a professional that is not in the organization', async () => {
    const organization = makeOrganization()
    const professional = makeProfessional()

    await inMemoryOrganizationRepository.create(organization)
    await inMemoryProfessionalRepository.create(professional)

    const response = await sut.execute({
      organizationId: organization.id.toString(),
      professionalId: professional.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
  })

  it('should be able to remove one professional while keeping others in the organization', async () => {
    const professional1 = makeProfessional()
    const professional2 = makeProfessional()
    const organization = makeOrganization()

    await inMemoryProfessionalRepository.create(professional1)
    await inMemoryProfessionalRepository.create(professional2)
    await inMemoryOrganizationRepository.create(organization)

    // Add both professionals to organization
    organization.addProfessional(professional1.id)
    organization.addProfessional(professional2.id)
    professional1.organizationId = organization.id
    professional2.organizationId = organization.id

    await inMemoryOrganizationRepository.save(organization)
    await inMemoryProfessionalRepository.save(professional1)
    await inMemoryProfessionalRepository.save(professional2)

    // Remove only professional1
    const response = await sut.execute({
      organizationId: organization.id.toString(),
      professionalId: professional1.id.toString(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { organization: updatedOrganization } = response.value

      expect(updatedOrganization.professionalsIds).toHaveLength(1)
      expect(updatedOrganization.professionalsIds).toContainEqual(
        professional2.id
      )
      expect(updatedOrganization.professionalsIds).not.toContainEqual(
        professional1.id
      )
    }

    // Check that only professional1's organizationId is cleared
    const updatedProfessional1 = await inMemoryProfessionalRepository.findById(
      professional1.id.toString()
    )
    const updatedProfessional2 = await inMemoryProfessionalRepository.findById(
      professional2.id.toString()
    )

    expect(updatedProfessional1?.organizationId).toBeNull()
    expect(updatedProfessional2?.organizationId?.equals(organization.id)).toBe(
      true
    )
  })
})
