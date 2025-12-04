import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Professional,
  type ProfessionalProps,
} from '@/domain/scheduling/enterprise/entities/professional'
import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import { faker } from '@faker-js/faker'

export function makeProfessional(
  override?: Partial<ProfessionalProps>,
  id?: UniqueEntityId
) {
  const professional: Professional = Professional.create(
    {
      scheduleConfigurationId: new UniqueEntityId(),
      name: faker.person.firstName(),
      phone: faker.phone.number(),
      cancellationPolicyId: new UniqueEntityId(),
      notificationSettings: new NotificationSettings({
        channels: ['WHATSAPP', 'EMAIL'],
        dailySummaryTime: '20:00',
        enabledTypes: [
          'NEW_APPOINTMENT',
          'CANCELLATION',
          'CONFIRMATION',
          'CONFIRMED_LIST',
          'DAILY_SUMMARY',
          'PAYMENT_STATUS',
        ],
        reminderBeforeMinutes: 20,
      }),
      sessionPrice: 2000,
      officeAddress: faker.location.streetAddress(),
      ...override,
    },
    id
  )

  return professional
}
