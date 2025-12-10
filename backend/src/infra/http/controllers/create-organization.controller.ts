import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { ConflictError } from '@/domain/organization/application/use-cases/conflict-error'
import { CreateOrganizationUseCase } from '@/domain/organization/application/use-cases/create-organization'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common'
import {
  createOrganizationSchema,
  CreateOrganizationSchema,
} from './dto/create-organization.dto'

const bodyValidationPipe = new ZodValidationPipe(createOrganizationSchema)

@Controller('/organization')
export class CreateOrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly professionalRepository: ProfessionalRepository
  ) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe)
    body: CreateOrganizationSchema,
    @CurrentUser() { sub: userId }: UserPayload
  ) {
    const { address, cnpj, name } = body
    const professional = await this.professionalRepository.findByUserId(userId)

    // console.log('[Create Organization Controller] : ', body)

    if (!professional) {
      throw new NotFoundException('Professional not found.')
    }

    const result = await this.createOrganizationUseCase.execute({
      name,
      cnpj,
      address,
      ownerId: professional.id.toString(),
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ConflictError:
          throw new ConflictException(error.message)
        case NotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error?.message ?? 'Bad Request')
      }
    }

    return result
  }
}
