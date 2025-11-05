import { faker } from '@faker-js/faker'
import { type Either, right } from '@src/core/either'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'
import { Professional } from '../../enterprise/entities/professional'
import { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { ScheduleConfigurationList } from '../../enterprise/entities/schedule-configuration-list'
import { NotificationSettings } from '../../enterprise/entities/value-objects/notification-settings'
import type { ProfessionalRepository } from '../repositories/professional-repository'

export interface CreateProfessionalUseCaseProps {
  name: string
  phone: string
  officeAddress: string
}

type CreateProfessionalUseCaseResponse = Either<
  unknown,
  { professional: Professional }
>

export class CreateProfessionalUseCase {
  constructor(private professionalRepository: ProfessionalRepository) {}

  async execute({
    name,
    phone,
    officeAddress,
  }: CreateProfessionalUseCaseProps): Promise<CreateProfessionalUseCaseResponse> {
    const notificationSettings = NotificationSettings.create({
      channels: ['EMAIL', 'WHATSAPP'],
      dailySummaryTime: '18:00',
      enabledTypes: [
        'CANCELLATION',
        'CONFIRMED_LIST',
        'CONFIRMATION',
        'DAILY_SUMMARY',
      ],
      reminderBeforeMinutes: 50,
    })

    const professional = await Professional.create({
      userId: new UniqueEntityId(),
      scheduleConfigurationId: new UniqueEntityId(),
      name,
      phone,
      officeAddress,
      notificationSettings,
    })

    const cancellationPolicy = CancellationPolicy.create(
      {
        allowReschedule: true,
        cancelationFeePercentage: 0.5,
        description: faker.lorem.text(),
        minDaysBeforeNextAppointment: 8,
        minHoursBeforeCancellation: 7,
        professionalId: professional.id,
      },
      new UniqueEntityId('cancellation-policy-id')
    )

    const scheduleConfiguration = ScheduleConfiguration.create(
      {
        enableGoogleMeet: true,
        holidays: [],
        professionalId: professional.id,
        workingDays: new ScheduleConfigurationList(),
        workingHours: {
          start: '08:00',
          end: '23:00',
        },

        bufferIntervalMinutes: 60,
        sessionDurationMinutes: 50,
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    professional.cancellationPolicyId = cancellationPolicy.id
    professional.scheduleConfigurationId = scheduleConfiguration.id

    await this.professionalRepository.create(professional)

    return right({ professional })
  }
}
