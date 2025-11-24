import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import type { ProfessionalRepository } from '@src/domain/scheduling/application/repositories/professional-repository'
import { Organization } from '../../enterprise/entities/organization'
import { Slug } from '../../enterprise/value-objects/slug'
import type { OrganizationRepository } from '../repositories/organization.repository'
import { type Either, left, right } from './../../../../core/either'

export interface CreateOrganizationUseCaseRequest {
  ownerId: UniqueEntityId
  name: string
}

type CreateOrganizationUseCaseResponse = Either<
  NotFoundError,
  {
    organization: Organization
  }
>

export class CreateOrganizationUseCase {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async execute({
    name,
    ownerId,
  }: CreateOrganizationUseCaseRequest): Promise<CreateOrganizationUseCaseResponse> {
    const professional = await this.professionalRepository.findById(ownerId)

    if (!professional) {
      left(new NotFoundError('Professional not found.'))
    }

    const organization = Organization.create({
      name,
      ownerId,
      slug: Slug.createFromText(name),
    })

    await this.organizationRepository.create(organization)

    return right({
      organization,
    })
  }
}
