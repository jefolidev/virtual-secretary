import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'

export interface ChangeProfessionalWorkDaysUseCaseRequest {
  professionalId: string
  newDays: number[]
}

export type ChangeProfessionalWorkDaysUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  {
    scheduleConfiguration: any
  }
>

@Injectable()
export class ChangeProfessionalWorkDaysUseCase {
  constructor(
    private professionalRepository: ProfessionalRepository,
    private scheduleConfigurationRepository: ScheduleConfigurationRepository
  ) {}

  async execute({
    professionalId,
    newDays,
  }: ChangeProfessionalWorkDaysUseCaseRequest): Promise<ChangeProfessionalWorkDaysUseCaseResponse> {
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

    // Clear existing working days and add new ones
    scheduleConfiguration.workingDays = new WorkingDaysList(
      newDays.map((day) => day)
    )

    await this.scheduleConfigurationRepository.save(scheduleConfiguration)

    return right({
      scheduleConfiguration,
    })
  }
}
