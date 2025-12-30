import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { EditClientUseCase } from '@/domain/scheduling/application/use-cases/edit-client'
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
  EditClientBodySchema,
  editClientBodySchema,
} from './dto/edit-client.dto'

@Controller('client')
export class EditClientController {
  constructor(
    private readonly editClient: EditClientUseCase,
    private readonly clientRepository: ClientRepository
  ) {}

  @Put()
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(editClientBodySchema))
    body: EditClientBodySchema,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const { extraPreferences, periodPreference } = body

    const client = await this.clientRepository.findByUserId(userId)

    if (!client) {
      throw new NotFoundException()
    }

    const result = await this.editClient.execute({
      clientId: client.id.toString(),
      extraPreferences,
      periodPreference,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    return { client: result.value.client }
  }
}
