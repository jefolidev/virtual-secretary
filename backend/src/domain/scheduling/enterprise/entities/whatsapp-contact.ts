export interface WhatsappContactProps {
  userId?: string | null
  nickName: string
  phone: string
  profilePicUrl?: string | null
  isRegistred: boolean
  isOnline?: boolean
  lastSeen?: Date | null
  metadata?: Record<string, unknown> | null
  createdAt: Date
  updatedAt?: Date | null
}

import { Entity } from '@/core/entities/entity'
import type { Optional } from '@/core/entities/types/optional'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export class WhatsappContact extends Entity<WhatsappContactProps> {
  get userId() {
    return this.props.userId ?? null
  }
  set userId(value: string | null) {
    this.props.userId = value
    this.touch()
  }

  get isRegistred() {
    return this.props.isRegistred
  }

  set isRegistred(isRegistred: boolean) {
    this.props.isRegistred = isRegistred
  }

  get nickName() {
    return this.props.nickName
  }
  set nickName(value: string) {
    this.props.nickName = value
    this.touch()
  }

  get phone() {
    return this.props.phone
  }
  set phone(value: string) {
    this.props.phone = value
    this.touch()
  }

  get profilePicUrl() {
    return this.props.profilePicUrl ?? null
  }
  set profilePicUrl(value: string | null) {
    this.props.profilePicUrl = value
    this.touch()
  }

  get isOnline() {
    return !!this.props.isOnline
  }
  set isOnline(value: boolean) {
    this.props.isOnline = value
    this.touch()
  }

  get lastSeen() {
    return this.props.lastSeen ?? null
  }
  set lastSeen(value: Date | null) {
    this.props.lastSeen = value
    this.touch()
  }

  get metadata() {
    return this.props.metadata ?? null
  }
  set metadata(value: Record<string, unknown> | null) {
    this.props.metadata = value
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
    props: Optional<
      WhatsappContactProps,
      | 'createdAt'
      | 'updatedAt'
      | 'userId'
      | 'profilePicUrl'
      | 'isOnline'
      | 'lastSeen'
      | 'metadata'
    >,
    id?: UniqueEntityId,
  ) {
    const contact = new WhatsappContact(
      {
        ...props,
        userId: props.userId ?? null,
        profilePicUrl: props.profilePicUrl ?? null,
        isOnline: props.isOnline ?? false,
        lastSeen: props.lastSeen ?? null,
        metadata: props.metadata ?? null,
        createdAt: props.createdAt ?? new Date(),
      } as WhatsappContactProps,
      id,
    )

    return contact
  }
}
