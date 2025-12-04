import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import type { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import type { ProfessionalRepository } from '../repositories/professional.repository'
import type { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'

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
  }: EditScheduleConfigurationUseCaseRequest) {
    const professional = await this.professionalRepository.findById(
      new UniqueEntityId(professionalId)
    )

    if (!professional) return left(new NotFoundError('Professional not found.'))

    if (!professional.id.equals(new UniqueEntityId(professionalId))) {
      return left(new NotAllowedError())
    }

    const scheduleConfiguration =
      await this.scheduleConfigurationRepository.findByProfessionalId(
        new UniqueEntityId(professionalId)
      )

    const workingDaysList = new WorkingDaysList([0, 1, 3, 4, 5])

    workingDaysList.update(workingDays.getItems())

    if (!scheduleConfiguration.professionalId.equals(professional.id))
      return left(new NotAllowedError())

    scheduleConfiguration.bufferIntervalMinutes = bufferIntervalMinutes
    scheduleConfiguration.enableGoogleMeet = enableGoogleMeet
    scheduleConfiguration.holidays = holidays
    scheduleConfiguration.sessionDurationMinutes = sessionDurationMinutes
    scheduleConfiguration.workingDays = workingDaysList
    scheduleConfiguration.workingHours = workingHours

    await this.scheduleConfigurationRepository.save(scheduleConfiguration)

    return right({
      scheduleConfiguration,
    })
  }
}
