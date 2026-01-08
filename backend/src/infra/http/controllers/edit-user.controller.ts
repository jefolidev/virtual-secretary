import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { EditUserUseCase } from '@/domain/scheduling/application/use-cases/edit-user'
import { ConflictError } from '@/domain/scheduling/application/use-cases/errors/conflict-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Patch,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { EditUserBodySchema, editUserBodySchema } from './dto/edit-user.dto'

@Controller('me')
export class EditUserController {
  constructor(
    private readonly editUser: EditUserUseCase,
    private readonly userRepository: UserRepository
  ) {}

  @Patch('/profile')
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(editUserBodySchema))
    body: EditUserBodySchema,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const { email, name, phone } = body

    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new NotFoundException()
    }

    const result = await this.editUser.execute({
      userId: user.id.toString(),
      email,
      name,
      phone,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        case ConflictError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    return { user: result.value.user }
  }
}
