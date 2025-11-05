import { type Either, left, right } from '@src/core/either'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotAllowedError } from '@src/core/errors/not-allowed-error'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import type { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import type { ProfessionalRepository } from '../repositories/professional-repository'
import type { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'
import type { WorkingDaysRepository } from '../repositories/working-days-repository'

export interface EditScheduleConfigurationUseCaseRequest {
  professionalId: string
  workingHours: { start: string; end: string }
  sessionDurationMinutes: number
  bufferIntervalMinutes: number
  enableGoogleMeet: boolean
  holidays: Date[]
  workingDays: WorkingDaysList
}

export type EditScheduleConfigurationUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  {
    scheduleConfiguration: ScheduleConfiguration
  }
>

export class EditScheduleConfigurationUseCase {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private scheduleConfigurationRepository: ScheduleConfigurationRepository,
    private workingDaysRepository: WorkingDaysRepository
  ) {}

  async execute({
    professionalId,
    bufferIntervalMinutes,
    enableGoogleMeet,
    holidays,
    sessionDurationMinutes,
    workingDays,
    workingHours,
  }: EditScheduleConfigurationUseCaseRequest) {
    const professional = await this.professionalRepository.findById(
      new UniqueEntityId(professionalId)
    )

    if (!professional) return left(new NotFoundError('Professional not found.'))

    const scheduleConfiguration =
      await this.scheduleConfigurationRepository.findByProfessionalId(
        new UniqueEntityId(professionalId)
      )

    const currentWorkingDays =
      await this.workingDaysRepository.findByScheduleConfigurationId(
        scheduleConfiguration.id
      )

    const workingDaysList = new WorkingDaysList(currentWorkingDays)

    workingDaysList.update(workingDays.getItems())

    if (!scheduleConfiguration.professionalId.equals(professional.id))
      return left(new NotAllowedError())

    scheduleConfiguration.bufferIntervalMinutes = bufferIntervalMinutes
    scheduleConfiguration.enableGoogleMeet = enableGoogleMeet
    scheduleConfiguration.holidays = holidays
    scheduleConfiguration.sessionDurationMinutes = sessionDurationMinutes
    scheduleConfiguration.workingDays = workingDaysList

    await this.scheduleConfigurationRepository.save(scheduleConfiguration)

    return right({
      scheduleConfiguration,
    })
  }
}
