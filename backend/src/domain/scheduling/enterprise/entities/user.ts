import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

// TODO: Must have be two options to create an User: by whatsapp and by website

export interface UserProps {
  clientId?: UniqueEntityId
  professionalId?: UniqueEntityId
  addressId?: UniqueEntityId
  threadId?: UniqueEntityId
  name: string
  email: string
  whatsappNumber: string
  password: string
  role: 'PROFESSIONAL' | 'CLIENT'
  cpf: string
  gender: 'MALE' | 'FEMALE'
  birthDate: Date
  createdAt: Date
  updatedAt?: Date | null
}

export class User extends Entity<UserProps> {
  get clientId() {
    return this.props.clientId ?? undefined
  }

  set clientId(clientId: UniqueEntityId | undefined) {
    this.props.clientId = clientId
    this.touch()
  }

  get addressId() {
    return this.props.addressId ?? undefined
  }

  set addressId(addressId: UniqueEntityId | undefined) {
    this.props.addressId = addressId
    this.touch()
  }

  get threadId() {
    return this.props.threadId ?? undefined
  }

  set threadId(threadId: UniqueEntityId | undefined) {
    this.props.threadId = threadId
    this.touch()
  }

  get whatsappNumber() {
    return this.props.whatsappNumber
  }

  set whatsappNumber(whatsappNumber: string) {
    this.props.whatsappNumber = whatsappNumber
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

  set name(name: string) {
    this.props.name = name
    this.touch()
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

  get gender() {
    return this.props.gender
  }

  set gender(gender: 'MALE' | 'FEMALE') {
    this.props.gender = gender
    this.touch()
  }

  get birthDate() {
    return this.props.birthDate
  }

  set birthDate(birthDate: Date) {
    this.props.birthDate = birthDate
    this.touch()
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
      threadId,
      cpf,
      email,
      name,
      password,
      whatsappNumber,
      role,
      gender,
      birthDate,
      createdAt,
    }: Optional<UserProps, 'createdAt' | 'updatedAt' | 'threadId'>,
    id?: UniqueEntityId,
  ) {
    const user = new User(
      {
        clientId,
        professionalId,
        threadId,
        cpf,
        email,
        name,
        password,
        role,
        whatsappNumber,
        addressId,
        gender,
        birthDate,
        createdAt: createdAt ?? new Date(),
      },
      id,
    )

    return user
  }
}
