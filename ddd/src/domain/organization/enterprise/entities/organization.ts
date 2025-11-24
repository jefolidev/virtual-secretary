import { AggregateRoot } from '@src/core/entities/aggregate'
import type { Optional } from '@src/core/entities/types/optional'
import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import type { Slug } from '../value-objects/slug'

export interface OrganizationProps {
  ownerId: UniqueEntityId
  name: string
  slug: Slug
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

export class Organization extends AggregateRoot<OrganizationProps> {
  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  get slug() {
    return this.props.slug
  }

  get ownerId() {
    return this.props.ownerId
  }

  set ownerId(ownerId: UniqueEntityId) {
    this.props.ownerId = ownerId
    this.touch()
  }

  get isActive() {
    return this.props.isActive
  }

  set isActive(isActive: boolean) {
    this.props.isActive = isActive
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.createdAt
  }

  addProfessional(professionalId: UniqueEntityId) {}

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<OrganizationProps, 'isActive' | 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const organization = new Organization(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return organization
  }
}
