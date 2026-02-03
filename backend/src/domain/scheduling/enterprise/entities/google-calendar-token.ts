import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface GoogleCalendarTokenProps {
  professionalId: string
  accessToken: string
  refreshToken: string
  tokenType?: string
  scope?: string | null
  googleAccountEmail?: string | null

  createdAt: Date
  updatedAt?: Date | null
  expiresAt?: Date | null
}

export class GoogleCalendarToken extends Entity<GoogleCalendarTokenProps> {
  get professionalId() {
    return this.props.professionalId
  }

  get accessToken() {
    return this.props.accessToken
  }

  set accessToken(accessToken: string) {
    this.props.accessToken = accessToken
    this.touch()
  }

  get refreshToken() {
    return this.props.refreshToken
  }

  set refreshToken(refreshToken: string) {
    this.props.refreshToken = refreshToken
    this.touch()
  }

  get tokenType() {
    return this.props.tokenType
  }

  set tokenType(tokenType: string | undefined) {
    this.props.tokenType = tokenType
    this.touch()
  }

  get expiryDate() {
    return this.props.expiresAt
  }

  set expiresAt(expiresAt: Date | null | undefined) {
    this.props.expiresAt = expiresAt
    this.touch()
  }

  get scope() {
    return this.props.scope
  }

  set scope(scope: string | null | undefined) {
    this.props.scope = scope
    this.touch()
  }

  get googleAccountEmail() {
    return this.props.googleAccountEmail
  }

  set googleAccountEmail(googleAccountEmail: string | null | undefined) {
    this.props.googleAccountEmail = googleAccountEmail
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set updatedAt(updatedAt: Date | null | undefined) {
    this.props.updatedAt = updatedAt ?? this.createdAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<GoogleCalendarTokenProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityId,
  ) {
    const googleCalendarToken = new GoogleCalendarToken(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return googleCalendarToken
  }
}
