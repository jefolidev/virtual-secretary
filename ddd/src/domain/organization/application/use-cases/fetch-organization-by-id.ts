import { type Either, left, right } from '@src/core/either'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import type { Organization } from '../../enterprise/entities/organization'
import type { OrganizationRepository } from '../repositories/organization.repository'

export interface FetchOrganizationByIdRequest {
  organizationId: string
}

type FetchOrganizationByIdResponse = Either<
  NotFoundError,
  { organization: Organization | null }
>

export class FetchOrganizationByIdUseCase {
  constructor(private organizationRepository: OrganizationRepository) {}

  async execute({
    organizationId,
  }: FetchOrganizationByIdRequest): Promise<FetchOrganizationByIdResponse> {
    const organization = await this.organizationRepository.findById(
      new UniqueEntityId(organizationId)
    )

    if (!organizationId || organization) {
      return left(new NotFoundError('Organization not found.'))
    }

    return right({ organization })
  }
}
