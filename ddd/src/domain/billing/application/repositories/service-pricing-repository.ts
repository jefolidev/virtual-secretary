import type { ServicePricing } from '../../enterprise/entities/service-pricing'

export interface ServicePricingRepository {
  create(servicePricing: ServicePricing): Promise<void>
  save(servicePricing: ServicePricing): Promise<void>
}
