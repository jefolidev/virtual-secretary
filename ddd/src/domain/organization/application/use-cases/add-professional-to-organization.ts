import { type Either, left } from '@src/core/either'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import type { Professional } from './../../../scheduling/enterprise/entities/professional'

export interface AddProfessionalToOrganizationUseCaseRequest {
  organizationId: string
  professionalId: string
}

export type AddProfessionalToOrganizationUseCaseResponse = Either<
  NotFoundError,
  { professional: Professional }
>

export class AddProfessionalToOrganizationUseCase {
  async execute({
    organizationId,
    professionalId,
  }: AddProfessionalToOrganizationUseCaseRequest): Promise<AddProfessionalToOrganizationUseCaseResponse> {
    if (!organizationId) {
      return left(new NotFoundError('Organization not found or not exists.'))
    }

    if (!professionalId) {
      return left(new NotFoundError('Professional not found or not exists.'))
    }
  }
}
