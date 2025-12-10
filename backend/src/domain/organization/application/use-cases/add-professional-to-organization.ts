import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Injectable } from '@nestjs/common'
import { Organization } from '../../enterprise/entities/organization'
import { OrganizationRepository } from '../repositories/organization.repository'
import { ProfessionalAlreadyInOrganizationError } from './errors/professional-already-in-organization-error'

export interface AddProfessionalToOrganizationUseCaseRequest {
  organizationId: string
  professionalId: string
}

export type AddProfessionalToOrganizationUseCaseResponse = Either<
  NotFoundError | ProfessionalAlreadyInOrganizationError,
  { organization: Organization }
>

@Injectable()
export class AddProfessionalToOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly professionalRepository: ProfessionalRepository
  ) {}
  async execute({
    organizationId,
    professionalId,
  }: AddProfessionalToOrganizationUseCaseRequest): Promise<AddProfessionalToOrganizationUseCaseResponse> {
    const organization = await this.organizationRepository.findById(
      organizationId.toString()
    )

    const professional = await this.professionalRepository.findById(
      professionalId.toString()
    )

    if (!organization) {
      return left(new NotFoundError('Organization not found.'))
    }

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    const isProfessionalInOrganization = organization.professionalsIds.some(
      (id) => id.toString() === professionalId
    )

    if (isProfessionalInOrganization) {
      return left(new ProfessionalAlreadyInOrganizationError())
    }

    organization.addProfessional(new UniqueEntityId(professionalId))
    professional.organizationId = new UniqueEntityId(organizationId)

    await this.organizationRepository.save(organization)
    await this.professionalRepository.save(professional)

    return right({
      organization,
    })
  }
}
