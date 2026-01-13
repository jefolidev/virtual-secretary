import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { ProfessionalWithNotificationSettings } from '../../enterprise/entities/value-objects/professional-with-notification-settings'
import { ProfessionalRepository } from '../repositories/professional.repository'

export interface FetchProfessionalWithNotificationSettingsRequest {
  professionalId: string
}

export type FetchProfessionalWithNotificationSettingsResponse = Either<
  NotFoundError,
  {
    professional: ProfessionalWithNotificationSettings
  }
>

@Injectable()
export class FetchProfessionalWithNotificationSettingsUseCase {
  constructor(
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  async execute({
    professionalId,
  }: FetchProfessionalWithNotificationSettingsRequest): Promise<FetchProfessionalWithNotificationSettingsResponse> {
    const professional =
      await this.professionalRepository.findByProfessionalIdWithNotificationSettings(
        professionalId
      )

    if (!professional) return left(new NotFoundError('Professional not found'))

    return right({ professional })
  }
}
