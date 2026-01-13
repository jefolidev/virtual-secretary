import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'
import { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'

export interface FetchProfessionalScheduleSettingsRequest {
  professionalId: string
}

export type FetchProfessionalScheduleSettingsResponse = Either<
  NotFoundError,
  {
    scheduleConfiguration: ScheduleConfiguration | null
    cancellationPolicy: CancellationPolicy | null
    sessionPrice: number
  }
>

@Injectable()
export class FetchProfessionalScheduleSettingsUseCase {
  constructor(
    private readonly professionals: ProfessionalRepository,
    private readonly scheduleConfigs: ScheduleConfigurationRepository,
    private readonly cancellationPolicies: CancellationPolicyRepository
  ) {}

  async execute({
    professionalId,
  }: FetchProfessionalScheduleSettingsRequest): Promise<FetchProfessionalScheduleSettingsResponse> {
    const professional = await this.professionals.findById(professionalId)
    if (!professional) return left(new NotFoundError('Professional not found'))

    const scheduleConfiguration =
      await this.scheduleConfigs.findByProfessionalId(professionalId)
    const cancellationPolicy =
      await this.cancellationPolicies.findByProfessionalId(professionalId)

    return right({
      scheduleConfiguration,
      cancellationPolicy,
      sessionPrice: professional.sessionPrice,
    })
  }
}
