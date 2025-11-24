import { type Either, left, right } from '@src/core/either'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotFoundError } from '@src/core/errors/resource-not-found-error'
import {
  ServicePricing,
  type TServiceType,
} from '../../enterprise/entities/service-pricing'
import type { ServicePricingRepository } from '../repositories/service-pricing-repository'
import { NegativeValueError } from './errors/negative-value-error'

export interface CreateServicePricingUseCaseRequest {
  professionalId: string
  serviceType: TServiceType
  basePrice: number
  effectiveDate: Date
}

export type CreateServicePricingResponse = Either<
  NegativeValueError | NotFoundError,
  {
    servicePricing: ServicePricing
  }
>

export class CreateServicePricingUseCase {
  constructor(
    private readonly servicePricingRepository: ServicePricingRepository
  ) {}

  async execute({
    professionalId,
    basePrice,
    serviceType,
    effectiveDate,
  }: CreateServicePricingUseCaseRequest): Promise<CreateServicePricingResponse> {
    if (basePrice < 0) {
      return left(new NegativeValueError())
    }

    if (!professionalId) {
      return left(new NotFoundError('Please provide a valid professional id.'))
    }

    const servicePricing = ServicePricing.create({
      professionalId: new UniqueEntityId(professionalId),
      basePrice,
      serviceType,
      effectiveDate,
    })

    await this.servicePricingRepository.create(servicePricing)

    return right({
      servicePricing,
    })
  }
}
