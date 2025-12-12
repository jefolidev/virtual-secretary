import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ConflictError } from '@/domain/organization/application/use-cases/conflict-error'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { CreateScheduleConfigurationUseCase } from '@/domain/scheduling/application/use-cases/create-schedule-configuration'
import { ValidationError } from '@/domain/scheduling/application/use-cases/errors/validation-error'
import { WorkingDaysList } from '@/domain/scheduling/enterprise/entities/value-objects/working-days-list'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  createScheduleConfigurationBodySchema,
  CreateScheduleConfigurationBodySchema,
} from './dto/create-schedule-configuration.dto'

@Controller('/profissional/schedule-configuration')
export class CreateScheduleConfigurationController {
  constructor(
    private readonly createScheduleConfigurationUseCase: CreateScheduleConfigurationUseCase,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createScheduleConfigurationBodySchema))
    body: CreateScheduleConfigurationBodySchema,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const {
      bufferIntervalMinutes,
      enableGoogleMeet,
      daysOfWeek,
      startTime,
      endTime,
      holidays,
      sessionDurationMinutes,
    } = body

    const professional = await this.professionalRepository.findByUserId(userId)

    if (!professional) {
      throw new NotFoundException()
    }

    const result = await this.createScheduleConfigurationUseCase.execute({
      professionalId: professional.id.toString(),
      workingDays: new WorkingDaysList(daysOfWeek),
      workingHours: { start: startTime, end: endTime },
      sessionDurationMinutes,
      bufferIntervalMinutes,
      holidays: holidays || [],
      enableGoogleMeet,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ConflictError:
          throw new ConflictException(error.message)
        case NotFoundError:
          throw new NotFoundException(error.message)
        case ValidationError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const scheduleConfiguration = result.value.scheduleConfiguration

    return {
      schedule_configuration: scheduleConfiguration,
    }
  }
}
