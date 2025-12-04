import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { CreateAppointmentUseCase } from '@/domain/scheduling/application/use-cases/create-schedule'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard, UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  createScheduleBodySchema,
  CreateScheduleBodySchema,
} from './dto/create-schedule.dto'

const bodyValidationPipe = new ZodValidationPipe(createScheduleBodySchema)

@Controller('/schedules')
@UseGuards(JwtAuthGuard)
export class CreateScheduleController {
  constructor(
    private readonly createScheduleUseCase: CreateAppointmentUseCase,
    private readonly clientRepository: ClientRepository
  ) {}

  @Post()
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
      throw new BadRequestException(result.value.message)
    }
  }
}
