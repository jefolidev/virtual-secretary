import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import type { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional-repository'
import type { Organization } from '../../enterprise/entities/organization'
import type { OrganizationRepository } from '../repositories/organization.repository'

export interface AddProfessionalToOrganizationUseCaseRequest {
  organizationId: string
  professionalId: string
}

export type AddProfessionalToOrganizationUseCaseResponse = Either<
  NotFoundError,
  { organization: Organization }
>

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
      new UniqueEntityId(organizationId)
    )

    const professional = await this.professionalRepository.findById(
      new UniqueEntityId(professionalId)
    )

    if (!organization) {
      return left(new NotFoundError('Organization not found.'))
    }

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    organization.addProfessional(new UniqueEntityId(professionalId))

    await this.organizationRepository.create(organization)

    return right({
      organization,
    })
  }
}
