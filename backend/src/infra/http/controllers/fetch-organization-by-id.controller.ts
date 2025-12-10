import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { FetchOrganizationByIdUseCase } from '@/domain/organization/application/use-cases/fetch-organization-by-id'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { OrganizationPresenter } from '../presenters/organization-presenter'

@Controller('/organization')
export class FetchOrganizationByIdController {
  constructor(
    private readonly fetchOrganizationByIdUseCase: FetchOrganizationByIdUseCase
  ) {}

  @Get('/:id')
  async handle(@Param('id') organizationId: string) {
    const result = await this.fetchOrganizationByIdUseCase.execute({
      organizationId,
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

    const organization = result.value.organization

    return {
      organizations: OrganizationPresenter.toHTTP(organization),
    }
  }
}
