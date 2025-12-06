import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'
import {
  Professional as PrismaProfessionalUser,
  User as PrismaUser,
} from '@prisma/generated/client'

type PrismaProfessionalWithUser = PrismaProfessionalUser & {
  user: PrismaUser
}

export class PrismaProfessionalMapper {
  static toDomain(raw: PrismaProfessionalWithUser): Professional {
    if (!raw.user) {
      throw new Error(
        `Professional com ID ${raw.id} não possui um usuário (User) associado.`
      )
    }

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
