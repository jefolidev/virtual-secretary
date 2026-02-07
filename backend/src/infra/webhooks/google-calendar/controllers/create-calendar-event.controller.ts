import { CreateCalendarEventUseCase } from '@/domain/scheduling/application/use-cases/create-calendar-event'
import { NotConnectedError } from '@/domain/scheduling/application/use-cases/errors/not-connected-error'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import z from 'zod'

const createCalendarEventBodySchema = z.object({
  appointmentId: z.uuid(),
})

export type CreateCalendarEventBodySchema = z.infer<
  typeof createCalendarEventBodySchema
>
@Controller('calendar-events')
export class CreateCalendarEventController {
  constructor(
    private readonly createCalendarEventUseCase: CreateCalendarEventUseCase,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCalendarEventBodySchema))
  async create(@Body() body: CreateCalendarEventBodySchema) {
    const parsedBody = createCalendarEventBodySchema.parse(body)
    const { appointmentId } = parsedBody

    const result = await this.createCalendarEventUseCase.execute({
      appointmentId,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof NotConnectedError) {
        throw new UnauthorizedException(error.message)
      }

      throw new BadRequestException('Unknown error occurred')
    }

    return {
      eventId: result.value.eventId,
      eventLink: result.value.eventLink,
    }
  }
}
