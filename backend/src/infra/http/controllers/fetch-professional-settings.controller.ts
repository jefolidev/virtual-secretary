import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { FetchProfessionalScheduleSettingsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-schedule-settings'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common'

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

    const result = await this.fetchProfessionalScheduleSettings.execute({
      professionalId: professional.id.toString(),
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const { scheduleConfiguration, cancellationPolicy, sessionPrice } =
      result.value

    return {
      schedule_configuration: scheduleConfiguration,
      cancellation_policy: cancellationPolicy,
      session_price: sessionPrice,
    }
  }
}
