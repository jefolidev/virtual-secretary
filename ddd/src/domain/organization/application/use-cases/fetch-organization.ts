import { type Either, right } from '@src/core/either'
import type { Organization } from '../../enterprise/entities/organization'
import type { OrganizationRepository } from '../repositories/organization.repository'

type FetchOrganizationUseCaseResponse = Either<
  null,
  { organization: Organization[] }
>

export class FetchOrganizationUseCase {
  constructor(private organizationRepository: OrganizationRepository) {}

  async execute(): Promise<FetchOrganizationUseCaseResponse> {
    const organizations = await this.organizationRepository.findMany()

    return right({ organization: organizations || [] })
  }
}
