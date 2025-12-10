import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Injectable } from '@nestjs/common'
import { Organization } from '../../enterprise/entities/organization'
import { Slug } from '../../enterprise/value-objects/slug'
import { OrganizationRepository } from '../repositories/organization.repository'
import { Either, left, right } from './../../../../core/either'

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

@Injectable()
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
      organizationId.toString()
    )

    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    const professional = await this.professionalRepository.findById(
      organization.ownerId.toString()
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
