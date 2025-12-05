import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type PeriodPreferenceType = 'MORNING' | 'AFTERNOON' | 'EVENING'

export interface AddressProps {
  addressLine1: string
  addressLine2?: string | null
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Address extends Entity<AddressProps> {
  get addressLine1() {
    return this.props.addressLine1
  }
  set addressLine1(value: string) {
    this.props.addressLine1 = value
    this.touch()
  }

  get addressLine2() {
    return this.props.addressLine2 || null || undefined
  }
  set addressLine2(value: string | undefined) {
    this.props.addressLine2 = value
    this.touch()
  }

  get neighborhood() {
    return this.props.neighborhood
  }
  set neighborhood(value: string) {
    this.props.neighborhood = value
    this.touch()
  }

  get city() {
    return this.props.city
  }
  set city(value: string) {
    this.props.city = value
    this.touch()
  }

  get state() {
    return this.props.state
  }
  set state(value: string) {
    this.props.state = value
    this.touch()
  }

  get postalCode() {
    return this.props.postalCode
  }
  set postalCode(value: string) {
    this.props.postalCode = value
    this.touch()
  }

  get country() {
    return this.props.country
  }
  set country(value: string) {
    this.props.country = value
    this.touch()
  }
  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? this.props.createdAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<AddressProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const address = new Address(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    )

    return address
  }
}
