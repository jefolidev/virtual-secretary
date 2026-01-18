import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'

export class PrismaNotificationSettingsMapper {
  static toPrisma(notificationSettings: NotificationSettings) {
    return {
      id: undefined, // Será gerado pelo Prisma
      enabledTypes: notificationSettings.enabledTypes,
      reminderBeforeMinutes: notificationSettings.reminderBeforeMinutes,
      dailySummaryTime: notificationSettings.dailySummaryTime,
    }
  }

  static toDomain(raw: any): NotificationSettings {
    return NotificationSettings.create({
      enabledTypes: raw.enabledTypes,
      reminderBeforeMinutes: raw.reminderBeforeMinutes,
      dailySummaryTime: raw.dailySummaryTime,
    })
  }
}
