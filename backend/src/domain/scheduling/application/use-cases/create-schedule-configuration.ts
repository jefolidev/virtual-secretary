import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'
import { ConflictError } from './errors/conflict-error'
import { ValidationError } from './errors/validation-error'

interface CreateScheduleConfigurationUseCaseProps {
  professionalId: string
  workingDays: WorkingDaysList
  workingHours: { start: string; end: string }
  sessionDurationMinutes: number
  bufferIntervalMinutes: number
  holidays?: Date[]
  enableGoogleMeet?: boolean
}

type CreateScheduleConfigurationUseCaseResponse = Either<
  NotFoundError | ValidationError | ConflictError,
  {
    scheduleConfiguration: ScheduleConfiguration
  }
>

@Injectable()
export class CreateScheduleConfigurationUseCase {
  constructor(
    readonly scheduleConfigurationRepository: ScheduleConfigurationRepository,
    readonly professionalRepository: ProfessionalRepository
  ) {}

  async execute({
    professionalId,
    workingDays,
    workingHours,
    sessionDurationMinutes,
    bufferIntervalMinutes,
    holidays,
    enableGoogleMeet,
  }: CreateScheduleConfigurationUseCaseProps): Promise<CreateScheduleConfigurationUseCaseResponse> {
    const professional = await this.professionalRepository.findById(
      professionalId
    )

    if (!professional) {
      return left(new NotFoundError('Professional not found'))
    }

    if (professional.scheduleConfigurationId) {
      return left(
        new ConflictError('Professional already has a schedule configuration')
      )
    }

    const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (
      !timeFormat.test(workingHours.start) ||
      !timeFormat.test(workingHours.end)
    ) {
      return left(new ValidationError('Working hours must be in HH:MM format'))
    }

    const [startHour, startMinute] = workingHours.start.split(':').map(Number)
    const [endHour, endMinute] = workingHours.end.split(':').map(Number)
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    if (startTotalMinutes >= endTotalMinutes) {
      return left(
        new ValidationError('Working start time must be before end time')
      )
    }

    if (sessionDurationMinutes <= 0 || sessionDurationMinutes > 480) {
      return left(
        new ValidationError(
          'Session duration must be between 1 and 480 minutes'
        )
      )
    }

    if (bufferIntervalMinutes < 0 || bufferIntervalMinutes > 120) {
      return left(
        new ValidationError('Buffer interval must be between 0 and 120 minutes')
      )
    }

    if (!workingDays || workingDays.currentItems.length === 0) {
      return left(
        new ValidationError('At least one working day must be selected')
      )
    }

    const scheduleConfiguration = ScheduleConfiguration.create({
      professionalId: new UniqueEntityId(professionalId),
      workingDays,
      workingHours,
      sessionDurationMinutes,
      bufferIntervalMinutes,
      holidays: holidays || [],
      enableGoogleMeet: enableGoogleMeet ?? false,
    })

    await this.scheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = scheduleConfiguration.id
    await this.professionalRepository.save(professional)

    return right({
      scheduleConfiguration,
    })
  }
}
