import { CpfAlreadyExists as CpfAlreadyExistsError } from '@/domain/scheduling/application/use-cases/errors/cpf-already-exists'
import { PhoneAlreadyExistsError } from '@/domain/scheduling/application/use-cases/errors/phone-already-exists'
import { UserAlreadyExists as UserAlreadyExistsError } from '@/domain/scheduling/application/use-cases/errors/user-already-exists'
import { RegisterUserUseCase } from '@/domain/scheduling/application/use-cases/register-user'
import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import { Public } from '@/infra/auth/public'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import {
  CreateUserAccountBodySchema,
  createUserAccountBodySchema,
} from './dto/create-account.dto'

@Controller('/register')
export class CreateAccountController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post()
  @Public()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserAccountBodySchema))
  async handle(@Body() body: CreateUserAccountBodySchema) {
    const {
      cpf,
      email,
      name,
      phone,
      password,
      address,
      role,
      clientData,
      professionalData,
    } = body

    const result = await this.registerUserUseCase.execute({
      address: {
        ...address,
        createdAt: new Date(),
      },
      cpf,
      email,
      name,
      phone,
      password,
      role,
      clientData,
      professionalData: professionalData
        ? {
            sessionPrice: professionalData.sessionPrice,
            notificationSettings: NotificationSettings.create({
              channels: professionalData.notificationSettings.channels,
              enabledTypes: professionalData.notificationSettings.enabledTypes,
              reminderBeforeMinutes:
                professionalData.notificationSettings.reminderBeforeMinutes,
              dailySummaryTime:
                professionalData.notificationSettings.dailySummaryTime,
            }),
          }
        : undefined,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        case PhoneAlreadyExistsError:
          throw new ConflictException(error.message)
        case CpfAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    const { user } = result.value

    return {
      user_id: user.id.toString(),
      role: user.role,
      professional_id: user.professionalId?.toString(),
      client_id: user.clientId?.toString(),
    }
  }
}
