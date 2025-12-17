import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'

export class PrismaNotificationSettingsMapper {
  static toPrisma(notificationSettings: NotificationSettings) {
    return {
      id: undefined, // Será gerado pelo Prisma
      channels: notificationSettings.channels,
      enabledTypes: notificationSettings.enabledTypes,
      reminderBeforeMinutes: notificationSettings.reminderBeforeMinutes,
      dailySummaryTime: notificationSettings.dailySummaryTime,
    }
  }

  static toDomain(raw: any): NotificationSettings {
    return NotificationSettings.create({
      channels: raw.channels,
      enabledTypes: raw.enabledTypes,
      reminderBeforeMinutes: raw.reminderBeforeMinutes,
      dailySummaryTime: raw.dailySummaryTime,
    })
  }
}
