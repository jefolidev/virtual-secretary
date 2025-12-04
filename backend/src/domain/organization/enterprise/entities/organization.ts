import { AggregateRoot } from '@/core/entities/aggregate'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AddedProfessionalToOrganizationEvent } from '../events/added-professional-organization'
import { RemovedProfessionalFromOrganizationEvent } from '../events/remove-professional-organization'
import { ProfessionalIdList } from '../value-objects/professional-id-list'
import { Slug } from '../value-objects/slug'

export interface OrganizationProps {
  ownerId: UniqueEntityId
  professionalsIds: ProfessionalIdList
  name: string
  cnpj: string
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

  get professionalsIds() {
    return this.props.professionalsIds.currentItems
  }

  get slug() {
    return this.props.slug
  }

  set slug(slug: Slug) {
    this.props.slug = slug
    this.touch()
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

  public addProfessional(professionalId: UniqueEntityId): void {
    this.props.professionalsIds.add(professionalId)
    this.touch()

    this.addDomainEvent(
      new AddedProfessionalToOrganizationEvent(
        this.id,
        professionalId,
        this.name
      )
    )
  }

  public removeProfessional(professionalId: UniqueEntityId): void {
    this.props.professionalsIds.remove(professionalId)
    this.touch()

    this.addDomainEvent(
      new RemovedProfessionalFromOrganizationEvent(
        this.id,
        professionalId,
        this.name
      )
    )
  }

  public hasProfessional(professionalId: UniqueEntityId): boolean {
    return this.props.professionalsIds.exists(professionalId)
  }

  get professionalsCount(): number {
    return this.props.professionalsIds.currentItems.length
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      OrganizationProps,
      'isActive' | 'slug' | 'createdAt' | 'professionalsIds'
    >,
    id?: UniqueEntityId
  ) {
    const organization = new Organization(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.name),
        professionalsIds: props.professionalsIds ?? new ProfessionalIdList(),
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return organization
  }
}
