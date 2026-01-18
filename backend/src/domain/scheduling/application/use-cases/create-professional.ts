import { Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'
import { Professional } from '../../enterprise/entities/professional'
import { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import {
  NotificationSettings,
  NotificationType,
} from '../../enterprise/entities/value-objects/notification-settings'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { ProfessionalRepository } from '../repositories/professional.repository'

export interface CreateProfessionalUseCaseProps {
  sessionPrice: number
  dailySummaryTime: string
  enabledTypes: NotificationType[]
  reminderBeforeMinutes?: number
}

type CreateProfessionalUseCaseResponse = Either<
  unknown,
  { professional: Professional }
>
@Injectable()
export class CreateProfessionalUseCase {
  constructor(private professionalRepository: ProfessionalRepository) {}

  async execute({
    sessionPrice,
    dailySummaryTime,
    enabledTypes,
    reminderBeforeMinutes,
  }: CreateProfessionalUseCaseProps): Promise<CreateProfessionalUseCaseResponse> {
    const notificationSettings = NotificationSettings.create({
      dailySummaryTime,
      enabledTypes,
      reminderBeforeMinutes,
    })

    const professional = await Professional.create({
      sessionPrice,
      notificationSettings,
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
      new UniqueEntityId(),
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
      new UniqueEntityId(),
    )

    const workingDaysList = new WorkingDaysList([0, 1, 2, 3, 4, 5, 6])

    scheduleConfiguration.workingDays = workingDaysList

    professional.cancellationPolicyId = cancellationPolicy.id
    professional.scheduleConfigurationId = scheduleConfiguration.id

    await this.professionalRepository.create(professional)

    return right({ professional })
  }
}
