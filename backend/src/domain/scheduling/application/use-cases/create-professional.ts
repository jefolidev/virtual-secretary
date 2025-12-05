import { Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'
import { Professional } from '../../enterprise/entities/professional'
import { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { NotificationSettings } from '../../enterprise/entities/value-objects/notification-settings'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { ProfessionalRepository } from '../repositories/professional.repository'

export interface CreateProfessionalUseCaseProps {
  name: string
  phone: string
  sessionPrice: number
}

type CreateProfessionalUseCaseResponse = Either<
  unknown,
  { professional: Professional }
>
@Injectable()
export class CreateProfessionalUseCase {
  constructor(private professionalRepository: ProfessionalRepository) {}

  async execute({
    name,
    phone,
    sessionPrice,
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
      name,
      phone,
      sessionPrice,
    })

    const cancellationPolicy = await CancellationPolicy.create(
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

    const scheduleConfiguration = await ScheduleConfiguration.create(
      {
        enableGoogleMeet: true,
        professionalId: professional.id,
        holidays: [],

        workingHours: {
          start: '08:00',
          end: '23:00',
        },

        bufferIntervalMinutes: 60,
        sessionDurationMinutes: 50,
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    const workingDaysList = new WorkingDaysList([0, 1, 2, 3, 4, 5, 6])

    scheduleConfiguration.workingDays = workingDaysList

    professional.cancellationPolicyId = cancellationPolicy.id
    professional.scheduleConfigurationId = scheduleConfiguration.id

    await this.professionalRepository.create(professional)

    return right({ professional })
  }
}
