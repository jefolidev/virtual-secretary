import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import { ProfessionalWithNotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/professional-with-notification-settings'
import { BadRequestException } from '@nestjs/common'
import {
  NotificationSettings as PrismaNotificationSettings,
  Professional,
} from '../../../generated/prisma'

type PrismaProfessionalWithNotificationSettings = Professional & {
  notificationSettings: PrismaNotificationSettings | null
}

export class PrismaProfessionalWithNotificationSettingsMapper {
  static toDomain(
    raw: PrismaProfessionalWithNotificationSettings,
  ): ProfessionalWithNotificationSettings {
    if (!raw.notificationSettings) {
      throw new BadRequestException('Notification settings not provided.')
    }

    const notificationSettings = NotificationSettings.create({
      enabledTypes: raw.notificationSettings.enabledTypes,
      reminderBeforeMinutes: raw.notificationSettings.reminderBeforeMinutes,
      dailySummaryTime: raw.notificationSettings.dailySummaryTime,
    })

    return ProfessionalWithNotificationSettings.create({
      notificationSettings,
      professionalId: new UniqueEntityId(raw.id),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }
}
