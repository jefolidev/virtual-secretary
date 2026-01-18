import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'

export interface EditScheduleConfigurationUseCaseRequest {
  professionalId: string
  sessionDurationMinutes?: number
  bufferIntervalMinutes?: number
  enableGoogleMeet?: boolean
  holidays?: Date[]
}

export type EditScheduleConfigurationUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  {
    scheduleConfiguration: ScheduleConfiguration
  }
>

@Injectable()
export class EditScheduleConfigurationUseCase {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private scheduleConfigurationRepository: ScheduleConfigurationRepository,
  ) {}

  async execute({
    professionalId,
    bufferIntervalMinutes,
    enableGoogleMeet,
    holidays,
    sessionDurationMinutes,
  }: EditScheduleConfigurationUseCaseRequest): Promise<EditScheduleConfigurationUseCaseResponse> {
    const professional =
      await this.professionalRepository.findById(professionalId)

    if (!professional) return left(new NotFoundError('Professional not found.'))

    if (!professional.id.equals(new UniqueEntityId(professionalId))) {
      return left(new NotAllowedError())
    }

    const scheduleConfiguration =
      await this.scheduleConfigurationRepository.findByProfessionalId(
        professionalId,
      )

    if (!scheduleConfiguration) {
      return left(new NotFoundError('Schedule Configuration not found.'))
    }

    if (!scheduleConfiguration.professionalId) {
      return left(new NotFoundError())
    }

    if (!scheduleConfiguration.professionalId.equals(professional.id))
      return left(new NotAllowedError())

    scheduleConfiguration.bufferIntervalMinutes =
      bufferIntervalMinutes ?? scheduleConfiguration.bufferIntervalMinutes
    scheduleConfiguration.enableGoogleMeet =
      enableGoogleMeet ?? scheduleConfiguration.enableGoogleMeet
    scheduleConfiguration.holidays = holidays ?? scheduleConfiguration.holidays
    scheduleConfiguration.sessionDurationMinutes =
      sessionDurationMinutes ?? scheduleConfiguration.sessionDurationMinutes

    await this.scheduleConfigurationRepository.save(scheduleConfiguration)

    return right({
      scheduleConfiguration,
    })
  }
}
