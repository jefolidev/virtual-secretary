import { ProfessionalWithNotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/professional-with-notification-settings'

export class ProfessionalWithNotificationSettingsPresenter {
  static toHTTP(professional: ProfessionalWithNotificationSettings) {
    return {
      id: professional.professionalId.toString(),
      notificationSettings: professional.notificationSettings,
      createdAt: professional.createdAt,
      updatedAt: professional.updatedAt,
    }
  }
}
