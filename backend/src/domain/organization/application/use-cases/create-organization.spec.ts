import { makeAddress } from '@test/factories/make-address'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAddressRepository } from '@test/repositories/in-memory-address.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryOrganizationRepository } from '../../../../../test/repositories/in-memory-organization.repository'
import { CreateOrganizationUseCase } from './create-organization'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryAddressRepository: InMemoryAddressRepository
let sut: CreateOrganizationUseCase

describe('Create Organization', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryAddressRepository = new InMemoryAddressRepository()
    sut = new CreateOrganizationUseCase(
      inMemoryProfessionalRepository,
      inMemoryOrganizationRepository,
      inMemoryAddressRepository
    )
  })

  it('should be able to create a organization', async () => {
    const professional = makeProfessional()

    inMemoryProfessionalRepository.create(professional)

    const response = await sut.execute({
      name: 'Organization John Doe',
      cnpj: '000000000000',
      address: makeAddress(),
      ownerId: professional.id.toString(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { organization } = response.value

      expect(organization.name).toBe('Organization John Doe')
      expect(organization.isActive).toBe(true)
      expect(organization.addressId).toBeTruthy()
      expect(organization.ownerId.toString().toString()).toMatch(
        professional.id.toString()
      )
      expect(organization.slug.value).toBe('organization-john-doe')
    }
  })
})
