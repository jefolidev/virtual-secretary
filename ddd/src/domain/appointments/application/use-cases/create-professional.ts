import { right, type Either } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Professional } from '../../enterprise/entities/professional'
import type { ProfessionalRepository } from '../repositories/professional-repository'

export interface CreateProfessionalUseCaseProps {
  name: string
  phone: string
  officeAddress: string
  notificationSettingsId: string
  cancellationPolicyId: string
}

type CreateProfessionalUseCaseResponse = Either<
  {},
  { professional: Professional }
>

export class CreateProfessionalUseCase {
  constructor(private professionalRepository: ProfessionalRepository) {}

  async execute({
    name,
    phone,
    officeAddress,
    notificationSettingsId,
    cancellationPolicyId,
  }: CreateProfessionalUseCaseProps): Promise<CreateProfessionalUseCaseResponse> {
    const professional = await Professional.create({
      userId: new UniqueEntityId(),
      name,
      phone,
      officeAddress,
      notificationSettingsId: new UniqueEntityId(notificationSettingsId),
      cancellationPolicyId: new UniqueEntityId(cancellationPolicyId),
    })

    await this.professionalRepository.create(professional)

    return right({ professional })
  }
}
