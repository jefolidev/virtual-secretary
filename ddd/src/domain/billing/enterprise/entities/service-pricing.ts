import { AggregateRoot } from '@src/core/entities/aggregate'
import type { Optional } from '@src/core/entities/types/optional'
import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'

export type TServiceType = 'ONLINE' | 'OFFLINE'

export interface ServicePricingProps {
  professionalId: UniqueEntityId
  serviceType: TServiceType
  basePrice: number
  isActive: boolean
  effectiveDate: Date
  createdAt: Date
  updatedAt?: Date
}

export class ServicePricing extends AggregateRoot<ServicePricingProps> {
  get professionalId() {
    return this.props.professionalId
  }

  get serviceType() {
    return this.props.serviceType
  }

  get basePrice() {
    return this.props.basePrice
  }

  set basePrice(price: number) {
    if (price < 0) {
      throw new Error('Price cannot be negative')
    }
    this.props.basePrice = price
    this.touch()
  }

  get isActive() {
    return this.props.isActive
  }

  get effectiveDate() {
    return this.props.effectiveDate
  }

  set effectiveDate(date: Date) {
    if (date < new Date()) {
      throw new Error('Effective date cannot be in the past')
    }
    this.props.effectiveDate = date
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }
  deactivate() {
    this.props.isActive = false
    this.touch()
  }

  activate() {
    this.props.isActive = true
    this.touch()
  }

  isEffective(): boolean {
    return this.isActive && new Date() >= this.effectiveDate
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<ServicePricingProps, 'isActive' | 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const pricing = new ServicePricing(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return pricing
  }
}
