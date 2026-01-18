import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Professional,
  type ProfessionalProps,
} from '@/domain/scheduling/enterprise/entities/professional'
import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'

export function makeProfessional(
  override?: Partial<ProfessionalProps>,
  id?: UniqueEntityId,
) {
  const professional: Professional = Professional.create(
    {
      sessionPrice: 2000,
      notificationSettings: NotificationSettings.create({
        enabledTypes: [
          'NEW_APPOINTMENT',
          'CANCELLATION',
          'CONFIRMATION',
          'DAILY_SUMMARY',
          'CONFIRMED_LIST',
          'PAYMENT_STATUS',
          'WELCOME',
          'REMOVAL',
        ],
        reminderBeforeMinutes: 30,
        dailySummaryTime: '18:00',
      }),
      ...override,
    },
    id,
  )

  return professional
}
