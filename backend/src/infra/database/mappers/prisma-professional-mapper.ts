import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'
import { Professional as PrismaProfessionalUser } from '@prisma/generated/client'

export class PrismaProfessionalMapper {
  static toPrisma(professional: Professional) {
    return {
      id: professional.id.toString(),
      createdAt: professional.createdAt,
      sessionPrice: professional.sessionPrice,
      cancellationPolicyId:
        professional.cancellationPolicyId?.toString() ?? null,
      organizationId: professional.organizationId?.toString() ?? null,
      scheduleConfigurationId:
        professional.scheduleConfigurationId?.toString() ?? null,
      updatedAt: professional.updatedAt ?? null,
      notificationSettingsId:
        professional.notificationSettingsId?.toString() ?? null,
    }
  }

  static toDomain(raw: PrismaProfessionalUser): Professional {
    return Professional.create(
      {
        createdAt: raw.createdAt,
        sessionPrice: Number(raw.sessionPrice),
        cancellationPolicyId: raw.cancellationPolicyId
          ? new UniqueEntityId(raw.cancellationPolicyId)
          : undefined,
        organizationId: raw.organizationId
          ? new UniqueEntityId(raw.organizationId)
          : undefined,
        scheduleConfigurationId: raw.scheduleConfigurationId
          ? new UniqueEntityId(raw.scheduleConfigurationId)
          : undefined,
        updatedAt: raw.updatedAt || null,
        notificationSettingsId: raw.notificationSettingsId
          ? new UniqueEntityId(raw.notificationSettingsId)
          : undefined,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
