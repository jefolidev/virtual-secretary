import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { Organization } from '../../enterprise/entities/organization'
import { OrganizationRepository } from '../repositories/organization.repository'

export interface FetchOrganizationByIdRequest {
  organizationId: string
}

type FetchOrganizationByIdResponse = Either<
  NotFoundError,
  { organization: Organization }
>

@Injectable()
export class FetchOrganizationByIdUseCase {
  constructor(private organizationRepository: OrganizationRepository) {}

  async execute({
    organizationId,
  }: FetchOrganizationByIdRequest): Promise<FetchOrganizationByIdResponse> {
    const organization = await this.organizationRepository.findById(
      organizationId.toString()
    )

    if (!organization) {
      return left(new NotFoundError('Organization not found.'))
    }

    return right({ organization })
  }
}
