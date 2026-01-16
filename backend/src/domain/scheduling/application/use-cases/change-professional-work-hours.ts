import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'

export interface ChangeProfessionalWorkHoursUseCaseRequest {
  professionalId: string
  newStartHour?: string
  newEndHour?: string
}

export type ChangeProfessionalWorkHoursUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  {
    scheduleConfiguration: any
  }
>

@Injectable()
export class ChangeProfessionalWorkHoursUseCase {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private scheduleConfigurationRepository: ScheduleConfigurationRepository
  ) {}

  async execute({
    professionalId,
    newStartHour,
    newEndHour,
  }: ChangeProfessionalWorkHoursUseCaseRequest): Promise<ChangeProfessionalWorkHoursUseCaseResponse> {
    const professional = await this.professionalRepository.findById(
      professionalId
    )

    if (!professional) return left(new NotFoundError('Professional not found.'))

    const scheduleConfiguration =
      await this.scheduleConfigurationRepository.findByProfessionalId(
        professionalId
      )

    if (!scheduleConfiguration)
      return left(new NotFoundError('Schedule configuration not found.'))

    if (
      !scheduleConfiguration.professionalId.equals(
        new UniqueEntityId(professionalId)
      )
    ) {
      return left(new NotAllowedError())
    }

    if (!newStartHour && !newEndHour) {
      return left(new BadRequestError('At least one hour must be provided.'))
    }

    if (newStartHour && newEndHour) {
      if (newStartHour >= newEndHour) {
        return left(
          new BadRequestError('Start hour must be earlier than end hour.')
        )
      }

      if (newEndHour <= newStartHour) {
        return left(
          new BadRequestError('End hour must be later than start hour.')
        )
      }

      if (newStartHour < '00:00' || newEndHour > '23:59') {
        return left(
          new BadRequestError('Hours must be between 00:00 and 23:59.')
        )
      }
    }

    scheduleConfiguration.workingHours.start = newStartHour
      ? newStartHour
      : scheduleConfiguration.workingHours.start

    scheduleConfiguration.workingHours.end = newEndHour
      ? newEndHour
      : scheduleConfiguration.workingHours.end

    await this.scheduleConfigurationRepository.save(scheduleConfiguration)

    return right({
      scheduleConfiguration,
    })
  }
}
