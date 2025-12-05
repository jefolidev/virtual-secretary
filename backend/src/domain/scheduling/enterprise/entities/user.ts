import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@prisma/client/runtime/client'

export interface UserProps {
  clientId?: UniqueEntityId
  professionalId?: UniqueEntityId
  addressId: UniqueEntityId
  name: string
  email: string
  phone: string
  password: string
  role: 'PROFESSIONAL' | 'CLIENT'
  cpf: string
  createdAt: Date
  updatedAt?: Date | null
}

export class User extends Entity<UserProps> {
  get clientId() {
    return this.props.clientId ?? undefined
  }

  get phone() {
    return this.props.phone
  }

  set clientId(clientId: UniqueEntityId | undefined) {
    this.props.clientId = clientId
    this.touch()
  }

  set professionalId(professionalId: UniqueEntityId | undefined) {
    this.props.professionalId = professionalId
    this.touch()
  }

  get professionalId() {
    return this.props.professionalId ?? undefined
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  set email(email: string) {
    this.props.email = email
    this.touch()
  }

  get password() {
    return this.props.password
  }

  set password(password: string) {
    this.props.password = password
    this.touch()
  }

  get role() {
    return this.props.role
  }

  set role(role: 'PROFESSIONAL' | 'CLIENT') {
    this.props.role = role
  }

  get cpf() {
    return this.props.cpf
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set updatedAt(value: Date | null | undefined) {
    this.props.updatedAt = value
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    {
      clientId,
      professionalId,
      addressId,
      cpf,
      email,
      name,
      password,
      phone,
      role,
      createdAt,
    }: Optional<UserProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityId
  ) {
    const user = new User(
      {
        clientId,
        professionalId,
        cpf,
        email,
        name,
        password,
        role,
        phone,
        addressId,
        createdAt: createdAt ?? new Date(),
      },
      id
    )

    return user
  }
}
