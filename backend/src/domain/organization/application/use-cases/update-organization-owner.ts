import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import type { Organization } from '../../enterprise/entities/organization'
import type { OrganizationRepository } from '../repositories/organization.repository'

export interface UpdateOrganizationOwnerUseCaseRequest {
  currentOwnerId: string
  newOwnerId: string
}

export type UpdateOrganizationOwnerUseCaseResponse = Either<
  NotFoundError,
  {
    organization: Organization
  }
>

export class UpdateOrganizationOwnerUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async execute({
    currentOwnerId,
    newOwnerId,
  }: UpdateOrganizationOwnerUseCaseRequest): Promise<UpdateOrganizationOwnerUseCaseResponse> {
    const organization = await this.organizationRepository.findByOwnerId(
      currentOwnerId.toString()
    )

    if (!organization) {
      return left(new NotFoundError('Not found organization'))
    }

    organization.ownerId = new UniqueEntityId(newOwnerId)

    await this.organizationRepository.save(organization)

    return right({
      organization,
    })
  }
}
