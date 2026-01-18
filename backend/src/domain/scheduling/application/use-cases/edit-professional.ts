import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { Professional } from '../../enterprise/entities/professional'
import {
  NotificationSettings,
  NotificationType,
} from '../../enterprise/entities/value-objects/notification-settings'
import { ProfessionalRepository } from '../repositories/professional.repository'

export interface EditProfessionalUseCaseRequest {
  professionalId: string
  sessionPrice?: number
  enabledTypes?: NotificationType[]
  reminderBeforeMinutes?: number
  dailySummaryTime?: string
}

export type EditProfessionalUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  {
    professional: Professional
  }
>

@Injectable()
export class EditProfessionalUseCase {
  constructor(private professionalRepository: ProfessionalRepository) {}

  async execute({
    professionalId,
    sessionPrice,
    enabledTypes,
    reminderBeforeMinutes,
    dailySummaryTime,
  }: EditProfessionalUseCaseRequest): Promise<EditProfessionalUseCaseResponse> {
    const professional =
      await this.professionalRepository.findById(professionalId)

    if (!professional) return left(new NotFoundError('Professional not found.'))

    if (!professional.id.equals(new UniqueEntityId(professionalId))) {
      return left(new NotAllowedError())
    }

    professional.sessionPrice = sessionPrice ?? professional.sessionPrice

    // Initialize notification settings if not present
    if (!professional.notificationSettings) {
      professional.notificationSettings = NotificationSettings.create({
        enabledTypes: enabledTypes || ['NEW_APPOINTMENT'],
        dailySummaryTime: dailySummaryTime || '08:00',
      })
    } else {
      professional.notificationSettings.enabledTypes =
        enabledTypes ?? professional.notificationSettings.enabledTypes

      professional.notificationSettings.reminderBeforeMinutes =
        reminderBeforeMinutes ??
        professional.notificationSettings.reminderBeforeMinutes
      professional.notificationSettings.dailySummaryTime =
        dailySummaryTime ?? professional.notificationSettings.dailySummaryTime
    }

    await this.professionalRepository.save(professional)

    return right({
      professional,
    })
  }
}
