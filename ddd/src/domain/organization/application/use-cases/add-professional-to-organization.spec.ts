import { makeOrganization } from '@test/factories/make-organization'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryOrganizationRepository } from '../../../../../test/repositories/in-memory-organization.repository'
import { AddProfessionalToOrganizationUseCase } from './add-professional-to-organization'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: AddProfessionalToOrganizationUseCase

describe('Add Professional Into An Organization', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    sut = new AddProfessionalToOrganizationUseCase(
      inMemoryOrganizationRepository,
      inMemoryProfessionalRepository
    )
  })

  it('should be able to add a professional into an organization', async () => {
    const organization = makeOrganization()

    const professionals = []
    for (let i = 1; i <= 5; i++) {
      const professional = makeProfessional({
        name: `Professional ${i}`,
      })
      professionals.push(professional)
      await inMemoryProfessionalRepository.create(professional)
    }

    await inMemoryOrganizationRepository.create(organization)

    const response = await sut.execute({
      organizationId: organization.id.toString(),
      professionalId: professionals[0]!.id.toString(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { organization } = response.value
      expect(organization.professionalsIds).toHaveLength(1)
    }
  })

  it('should be able to add multiple professionals to organization', async () => {
    const organization = makeOrganization()
    await inMemoryOrganizationRepository.create(organization)

    for (let i = 1; i <= 5; i++) {
      const professional = makeProfessional({ name: `Professional ${i}` })
      await inMemoryProfessionalRepository.create(professional)

      const response = await sut.execute({
        organizationId: organization.id.toString(),
        professionalId: professional.id.toString(),
      })

      expect(response.isRight()).toBe(true)
    }

    const updatedOrganization = await inMemoryOrganizationRepository.findById(
      organization.id
    )

    expect(updatedOrganization?.professionalsIds).toHaveLength(5)
  })
})
