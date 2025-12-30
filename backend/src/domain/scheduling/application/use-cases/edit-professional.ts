import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { Professional } from '../../enterprise/entities/professional'
import {
  NotificationChannel,
  NotificationType,
} from '../../enterprise/entities/value-objects/notification-settings'
import { ProfessionalRepository } from '../repositories/professional.repository'

export interface EditProfessionalUseCaseRequest {
  professionalId: string
  sessionPrice?: number
  channels?: NotificationChannel[]
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
    channels,
    enabledTypes,
    reminderBeforeMinutes,
    dailySummaryTime,
  }: EditProfessionalUseCaseRequest): Promise<EditProfessionalUseCaseResponse> {
    const professional = await this.professionalRepository.findById(
      professionalId
    )

    if (!professional) return left(new NotFoundError('Professional not found.'))

    if (!professional.id.equals(new UniqueEntityId(professionalId))) {
      return left(new NotAllowedError())
    }

    professional.sessionPrice = sessionPrice ?? professional.sessionPrice

    if (professional.notificationSettings) {
      if (channels) {
        professional.notificationSettings.channels = channels
      }
      if (enabledTypes) {
        professional.notificationSettings.enabledTypes = enabledTypes
      }
      if (reminderBeforeMinutes) {
        professional.notificationSettings.reminderBeforeMinutes =
          reminderBeforeMinutes
      }
      if (dailySummaryTime) {
        professional.notificationSettings.dailySummaryTime = dailySummaryTime
      }
    }

    await this.professionalRepository.save(professional)

    return right({
      professional,
    })
  }
}
