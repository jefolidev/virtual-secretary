import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { FetchProfessionalScheduleSettingsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-schedule-settings'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { Controller, Get, NotFoundException } from '@nestjs/common'
import { UserProfessionalWithSettingsPresenter } from '../presenters/user-profissional-with-settings'

@Controller('/professional')
export class FetchProfessionalSettingsController {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly fetchProfessionalScheduleSettings: FetchProfessionalScheduleSettingsUseCase
  ) {}

  @Get('/settings')
  async handle(@CurrentUser() { sub: userId }: UserPayload) {
    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new NotFoundException('Professional not found')
    }

    // Get the professional with all settings to use with the presenter
    const professionalWithSettings =
      await this.professionalRepository.findByProfessionalIdWithSettings(
        professional.id.toString()
      )

    if (!professionalWithSettings) {
      throw new NotFoundException('Professional settings not found')
    }

    return UserProfessionalWithSettingsPresenter.toHTTP(
      professionalWithSettings
    )
  }
}
