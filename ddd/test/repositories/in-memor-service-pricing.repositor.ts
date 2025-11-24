import type { ServicePricingRepository } from '@src/domain/billing/application/repositories/service-pricing-repository'
import type { ServicePricing } from '@src/domain/billing/enterprise/entities/service-pricing'

export class InMemoryServicePricingRepository
  implements ServicePricingRepository
{
  public items: ServicePricing[] = []

  async create(servicePricing: ServicePricing): Promise<void> {
    await this.items.push(servicePricing)
  }

  async save(servicePricing: ServicePricing): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === servicePricing.id
    )

    this.items[itemIndex] = servicePricing
  }
}
