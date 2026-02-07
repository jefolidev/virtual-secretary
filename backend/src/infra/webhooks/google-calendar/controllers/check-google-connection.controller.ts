import { CheckGoogleCalendarConnectionUseCase } from '@/domain/scheduling/application/use-cases/check-google-calendar-connection'
import { BadRequestException, Controller, Get, Param } from '@nestjs/common'

@Controller()
export class CheckGoogleConnectionController {
  constructor(
    private readonly checkGoogleCalendarConnection: CheckGoogleCalendarConnectionUseCase,
  ) {}

  @Get('connected/:professionalId')
  async handle(@Param('professionalId') professionalId: string) {
    const result = await this.checkGoogleCalendarConnection.execute({
      professionalId,
    })

    if (result.isLeft()) {
      console.error(result.value)
      throw new BadRequestException(
        'Failed to check Google Calendar connection',
      )
    }

    return {
      isConnected: result.value.isConnected,
    }
  }
}
