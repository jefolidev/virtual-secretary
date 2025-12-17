import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'
import {
  CancellationPolicy as PrismaCancellationPolicy,
  Professional as PrismaProfessional,
  ScheduleConfiguration as PrismaScheduleConfiguration,
  User as PrismaUser,
} from '@prisma/generated/client'

type UserProfessionalWithSettings = PrismaUser & {
  professional: PrismaProfessional
  cancellationPolicy: PrismaCancellationPolicy
  scheduleConfiguration: PrismaScheduleConfiguration
}

export class PrismaProfessionalMapper {
  static toPrisma(professional: Professional) {
    return {
      id: professional.id.toString(),
      createdAt: professional.createdAt,
      sessionPrice: professional.sessionPrice,
      cancellationPolicyId: professional.cancellationPolicyId?.toString(),
      organizationId: professional.organizationId?.toString(),
      scheduleConfigurationId: professional.scheduleConfigurationId?.toString(),
      updatedAt: professional.updatedAt,
      // notificationSettingsId será adicionado pelo repository quando necessário
    }
  }

  static toDomain(raw: PrismaProfessional): UserProfessionalWithSettings {
    return Professional.create(
      {
        
        sessionPrice: Number(raw.sessionPrice),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt || null,
      },
      new UniqueEntityId(raw.id)
    )
  }
}
