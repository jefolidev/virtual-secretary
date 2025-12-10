import type { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { AddressRepository } from '@/domain/scheduling/application/repositories/address.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import {
  Address,
  AddressProps,
} from '@/domain/scheduling/enterprise/entities/address'
import { Injectable } from '@nestjs/common'
import { Organization } from '../../enterprise/entities/organization'
import { ProfessionalIdList } from '../../enterprise/value-objects/professional-id-list'
import { Slug } from '../../enterprise/value-objects/slug'
import { OrganizationRepository } from '../repositories/organization.repository'
import { type Either, left, right } from './../../../../core/either'
import { ConflictError } from './conflict-error'

export interface CreateOrganizationUseCaseRequest {
  ownerId: string
  name: string
  cnpj: string
  address: Optional<AddressProps, 'createdAt'>
}

type CreateOrganizationUseCaseResponse = Either<
  NotFoundError,
  {
    organization: Organization
  }
>

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly addressRepository: AddressRepository
  ) {}

  async execute({
    name,
    ownerId,
    cnpj,
    address,
  }: CreateOrganizationUseCaseRequest): Promise<CreateOrganizationUseCaseResponse> {
    const professional = await this.professionalRepository.findById(
      ownerId.toString()
    )

    const organizationAddress = Address.create(address)

    await this.addressRepository.create(organizationAddress)

    if (!professional) {
      return left(new NotFoundError('Professional not found.'))
    }

    if (professional.organizationId) {
      return left(
        new ConflictError('This professional is already into an organization.')
      )
    }

    const organization = Organization.create({
      ownerId: new UniqueEntityId(ownerId),
      addressId: organizationAddress.id,
      professionalsIds: new ProfessionalIdList(),
      slug: Slug.createFromText(name),
      name,
      cnpj,
    })

    // Primeiro cria a organização
    await this.organizationRepository.create(organization)

    // Depois adiciona o profissional à organização
    professional.organizationId = organization.id
    organization.addProfessional(professional.id)

    // Salva as duas entidades em sequência
    await this.professionalRepository.save(professional)
    await this.organizationRepository.save(organization)

    return right({
      organization,
    })
  }
}
