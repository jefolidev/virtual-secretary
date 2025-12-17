import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Injectable } from '@nestjs/common'
import { OrganizationRepository } from '../repositories/organization.repository'
import { Organization } from './../../enterprise/entities/organization'
import { ProfessionalNotInOrganizationError } from './errors/professional-not-in-organization-error'

export interface RemoveProfessionalUseCaseRequest {
  organizationId: string
  professionalId: string
}

export type RemoveProfessionalFromOrganizationResponse = Either<
  NotFoundError | ProfessionalNotInOrganizationError,
  { organization: Organization }
>

@Injectable()
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
      organizationId.toString()
    )

    const professional = await this.professionalRepository.findById(
      professionalId.toString()
    )

    if (!organization) return left(new NotFoundError('Organization not found.'))

    if (!professional) return left(new NotFoundError('Professional not found.'))

    const isProfessionalInOrganization = organization.professionalsIds.some(
      (id) => id.toString() === professionalId
    )

    if (!isProfessionalInOrganization) {
      return left(new ProfessionalNotInOrganizationError())
    }

    organization.removeProfessional(new UniqueEntityId(professionalId))
    professional.organizationId = null

    await this.organizationRepository.save(organization)
    await this.professionalRepository.save(professional)

    return right({ organization })
  }
}
