import { type Either, left, right } from '@src/core/either'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import type { ProfessionalRepository } from '@src/domain/scheduling/application/repositories/professional-repository'
import type { OrganizationRepository } from '../repositories/organization.repository'
import type { Organization } from './../../enterprise/entities/organization'

export interface RemoveProfessionalUseCaseRequest {
  organizationId: string
  professionalId: string
}

export type RemoveProfessionalFromOrganizationResponse = Either<
  NotFoundError,
  { organization: Organization }
>

export class RemoveProfessionalFromOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly professionalRepository: ProfessionalRepository
  ) {}
  async execute({
    organizationId,
    professionalId,
  }: RemoveProfessionalUseCaseRequest): Promise<RemoveProfessionalFromOrganizationResponse> {
    const organization = await this.organizationRepository.findById(
      new UniqueEntityId(organizationId)
    )

    if (!organization) return left(new NotFoundError('Organization'))

    organization.removeProfessional(new UniqueEntityId(professionalId))
    await this.organizationRepository.save(organization)

    return right({ organization })
  }
}
