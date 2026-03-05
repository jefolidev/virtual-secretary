import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type MercadoPagoConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

export interface MercadoPagoTokenProps {
  professionalId: string
  accessToken: string
  refreshToken: string | null
  publicKey: string | null
  mpUserId: string
  expiresAt: Date | null
  createdAt: Date
  updatedAt?: Date | null
}

export class MercadoPagoToken extends Entity<MercadoPagoTokenProps> {
  get professionalId() {
    return this.props.professionalId
  }

  get accessToken() {
    return this.props.accessToken
  }

  set accessToken(value: string) {
    this.props.accessToken = value
    this.touch()
  }

  get refreshToken() {
    return this.props.refreshToken
  }

  set refreshToken(value: string | null) {
    this.props.refreshToken = value
    this.touch()
  }

  get publicKey() {
    return this.props.publicKey
  }

  set publicKey(value: string | null) {
    this.props.publicKey = value
    this.touch()
  }

  get mpUserId() {
    return this.props.mpUserId
  }

  get expiresAt() {
    return this.props.expiresAt
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? this.props.createdAt
  }

  public isExpired(): boolean {
    if (!this.props.expiresAt) return false
    return this.props.expiresAt < new Date()
  }

  public updateTokens(
    accessToken: string,
    refreshToken: string,
    publicKey: string,
    expiresAt: Date,
  ): void {
    this.props.accessToken = accessToken
    this.props.refreshToken = refreshToken
    this.props.publicKey = publicKey
    this.props.expiresAt = expiresAt
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<MercadoPagoTokenProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityId,
  ) {
    return new MercadoPagoToken(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
