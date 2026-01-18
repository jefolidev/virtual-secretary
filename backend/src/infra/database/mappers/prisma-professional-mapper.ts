import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'
import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import {
  CancellationPolicy as PrismaCancellationPolicy,
  NotificationSettings as PrismaNotificationSettings,
  Professional as PrismaProfessional,
  ScheduleConfiguration as PrismaScheduleConfiguration,
  User as PrismaUser,
} from '@prisma/generated/client'

type ProfessionalWithNotificationSettings = PrismaProfessional & {
  notificationSettings?: PrismaNotificationSettings | null
}

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
    }
  }

  static toDomain(raw: ProfessionalWithNotificationSettings): Professional {
    const notificationSettings = raw.notificationSettings
      ? NotificationSettings.create({
          enabledTypes: raw.notificationSettings.enabledTypes as any[],
          reminderBeforeMinutes: raw.notificationSettings.reminderBeforeMinutes,
          dailySummaryTime: raw.notificationSettings.dailySummaryTime,
        })
      : undefined

    return Professional.create(
      {
        organizationId: raw.organizationId
          ? new UniqueEntityId(raw.organizationId)
          : null,
        sessionPrice: Number(raw.sessionPrice),
        notificationSettings,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt || null,
      },
      new UniqueEntityId(raw.id),
    )
  }
}
