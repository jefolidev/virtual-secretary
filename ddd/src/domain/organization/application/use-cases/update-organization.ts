import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotAllowedError } from '@src/core/errors/not-allowed-error'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import type { ProfessionalRepository } from '@src/domain/scheduling/application/repositories/professional-repository'
import type { Organization } from '../../enterprise/entities/organization'
import { Slug } from '../../enterprise/value-objects/slug'
import type { OrganizationRepository } from '../repositories/organization.repository'
import { type Either, left, right } from './../../../../core/either'

export interface UpdateOrganizationUseCaseRequest {
  organizationId: string
  name: string
}

type UpdateOrganizationUseCaseResponse = Either<
  NotFoundError,
  {
    organization: Organization
  }
>
export class UpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  async execute({
    name,
    organizationId,
  }: UpdateOrganizationUseCaseRequest): Promise<UpdateOrganizationUseCaseResponse> {
    const organization = await this.organizationRepository.findById(
      new UniqueEntityId(organizationId)
    )

    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    const professional = await this.professionalRepository.findById(
      organization.ownerId
    )

    if (!professional || !organization.ownerId.equals(professional.id)) {
      return left(new NotAllowedError("You're not the organization owner."))
    }

    organization.name = name
    organization.slug = Slug.createFromText(name)

    await this.organizationRepository.save(organization)

    return right({
      organization,
    })
  }
}
