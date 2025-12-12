import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { CreateAppointmentUseCase } from '@/domain/scheduling/application/use-cases/create-schedule'
import { NoDisponibilityError } from '@/domain/scheduling/application/use-cases/errors/no-disponibility-error'
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
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  createScheduleBodySchema,
  CreateScheduleBodySchema,
} from './dto/create-schedule.dto'

const bodyValidationPipe = new ZodValidationPipe(createScheduleBodySchema)

@Controller('/appointments')
export class CreateScheduleController {
  constructor(
    private readonly createScheduleUseCase: CreateAppointmentUseCase,
    private readonly clientRepository: ClientRepository
  ) {}

  @Post('/schedule')
  @UsePipes()
  async handle(
    @Body(bodyValidationPipe)
    body: CreateScheduleBodySchema,
    @CurrentUser() user: UserPayload
  ) {
    const { professionalId, modality, startDateTime } = body

    const client = await this.clientRepository.findByUserId(user.sub)

    if (!client) {
      throw new NotFoundException()
    }

    const result = await this.createScheduleUseCase.execute({
      professionalId,
      clientId: client.id.toString(),
      modality,
      startDateTime,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case NoDisponibilityError:
          throw new ConflictException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const scheduledAppointment = result.value.appointment

    return { 
      scheduled_appointment: scheduledAppointment
    }
  }
}
