import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { FetchProfessionalWithNotificationSettingsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-notification-settings'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ProfessionalWithNotificationSettingsPresenter } from '../presenters/professional-with-notification-settings-presenter'

@Controller('/professional/:id/notification-settings')
export class FetchProfessionalWithNotificationSettingsController {
  constructor(
    private readonly fetchProfessionalWithNotificationSettingsIdUseCase: FetchProfessionalWithNotificationSettingsUseCase
  ) {}

  @Get()
  async handle(@Param('id') professionalId) {
    const result =
      await this.fetchProfessionalWithNotificationSettingsIdUseCase.execute({
        professionalId,
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

    const professional = result.value.professional

    return {
      professional:
        ProfessionalWithNotificationSettingsPresenter.toHTTP(professional),
    }
  }
}
