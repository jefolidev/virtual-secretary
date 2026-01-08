import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { EditScheduleConfigurationUseCase } from '@/domain/scheduling/application/use-cases/edit-schedule-configuration'
import { ValidationError } from '@/domain/scheduling/application/use-cases/errors/validation-error'
import { WorkingDaysList } from '@/domain/scheduling/enterprise/entities/value-objects/working-days-list'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Put,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  EditScheduleConfigurationBodySchema,
  editScheduleConfigurationBodySchema,
} from './dto/edit-schedule-configuration.dto'

@Controller('me')
export class EditScheduleConfigurationController {
  constructor(
    private readonly editScheduleConfiguration: EditScheduleConfigurationUseCase,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  @Put('/schedule-configuration')
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(editScheduleConfigurationBodySchema))
    body: EditScheduleConfigurationBodySchema,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const {
      bufferIntervalMinutes,
      enableGoogleMeet,
      holidays,
      sessionDurationMinutes,
      startTime,
      endTime,
      daysOfWeek,
    } = body

    const professional = await this.professionalRepository.findByUserId(userId)

    console.log(userId)

    if (!professional) {
      throw new NotFoundException()
    }

    const result = await this.editScheduleConfiguration.execute({
      bufferIntervalMinutes,
      enableGoogleMeet,
      holidays,
      sessionDurationMinutes,
      workingDays: new WorkingDaysList(daysOfWeek),
      workingHours: { start: startTime, end: endTime },
      professionalId: professional.id.toString(),
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case ValidationError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }
    const { scheduleConfiguration } = result.value

    return { schedule_configuration: scheduleConfiguration }
  }
}
