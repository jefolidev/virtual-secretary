import { GetAuthUrlUseCase } from '@/domain/scheduling/application/use-cases/get-google-auth-url'
import { BadRequestException, Controller, Get, Param } from '@nestjs/common'

@Controller('auth')
export class GetAuthUrlController {
  constructor(private readonly getAuthUrlUseCase: GetAuthUrlUseCase) {}

  @Get('url/:professionalId')
  async handle(@Param('professionalId') professionalId: string) {
    if (!professionalId) {
      throw new BadRequestException('professionalId is required')
    }

    const result = await this.getAuthUrlUseCase.execute({ professionalId })

    if (result.isLeft()) {
      throw new BadRequestException('Failed to generate auth URL')
    }

    return {
      url: result.value.authUrl,
    }
  }
}
