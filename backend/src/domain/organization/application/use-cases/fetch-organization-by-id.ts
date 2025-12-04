import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
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
      organizationId.toString()
    )

    if (!organizationId || organization) {
      return left(new NotFoundError('Organization not found.'))
    }

    return right({ organization })
  }
}
