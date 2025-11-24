import { InMemoryServicePricingRepository } from '@test/repositories/in-memor-service-pricing.repositor'
import dayjs from 'dayjs'
import { CreateServicePricingUseCase } from './create-service-pricing'

let inMemoryServicePricingRepository: InMemoryServicePricingRepository
let sut: CreateServicePricingUseCase

describe('Create Service Pricing', () => {
  beforeEach(() => {
    inMemoryServicePricingRepository = new InMemoryServicePricingRepository()

    sut = new CreateServicePricingUseCase(inMemoryServicePricingRepository)
  })

  it('should be able to send a service pricing', async () => {
    const result = await sut.execute({
      professionalId: 'professional-id',
      basePrice: 89,
      effectiveDate: dayjs().add(8, 'days').toDate(),
      serviceType: 'OFFLINE',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(inMemoryServicePricingRepository.items[0]).toEqual(
        result.value.servicePricing
      )

      expect(
        inMemoryServicePricingRepository.items[0]?.professionalId.toString()
      ).toEqual('professional-id')
    }
  })
})
