import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'

export interface EditScheduleConfigurationUseCaseRequest {
  professionalId: string
  workingHours?: { start?: string; end?: string }
  sessionDurationMinutes?: number
  bufferIntervalMinutes?: number
  enableGoogleMeet?: boolean
  holidays?: Date[]
  workingDays?: WorkingDaysList
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
    private scheduleConfigurationRepository: ScheduleConfigurationRepository
  ) {}

  async execute({
    professionalId,
    bufferIntervalMinutes,
    enableGoogleMeet,
    holidays,
    sessionDurationMinutes,
    workingDays,
    workingHours,
  }: EditScheduleConfigurationUseCaseRequest): Promise<EditScheduleConfigurationUseCaseResponse> {
    const professional = await this.professionalRepository.findById(
      professionalId
    )

    if (!professional) return left(new NotFoundError('Professional not found.'))

    if (!professional.id.equals(new UniqueEntityId(professionalId))) {
      return left(new NotAllowedError())
    }

    const scheduleConfiguration =
      await this.scheduleConfigurationRepository.findByProfessionalId(
        professionalId
      )

    const workingDaysList = workingDays
      ? new WorkingDaysList(workingDays.getItems())
      : scheduleConfiguration.workingDays

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
    scheduleConfiguration.workingDays = workingDaysList
    scheduleConfiguration.workingHours =
      workingHours?.start && workingHours?.end
        ? { start: workingHours.start, end: workingHours.end }
        : scheduleConfiguration.workingHours

    await this.scheduleConfigurationRepository.save(scheduleConfiguration)

    return right({
      scheduleConfiguration,
    })
  }
}
