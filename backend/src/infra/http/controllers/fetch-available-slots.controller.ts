import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { FetchAvailableSlotsUseCase } from '@/domain/scheduling/application/use-cases/fetch-available-slots'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import {
  fetchAvailableProfessionalSlotsQuerySchema,
  FetchAvailableProfessionalSlotsQuerySchema,
} from './dto/fetch-available-professional-slots.dto'

@Controller('/professional')
export class FetchAvailableProfessionalSlotsController {
  constructor(
    private readonly fetchAvailableProfessionalSlots: FetchAvailableSlotsUseCase
  ) {}

  @Get('/slots')
  async handle(
    @Query(new ZodValidationPipe(fetchAvailableProfessionalSlotsQuerySchema))
    query: FetchAvailableProfessionalSlotsQuerySchema
  ) {
    const { professionalId, startDate, endDate } = query

    const result = await this.fetchAvailableProfessionalSlots.execute({
      professionalId,
      startDate,
      endDate,
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

    const { professional, slots } = result.value

    return {
      professional: professional,
      slots: slots,
    }
  }
}
