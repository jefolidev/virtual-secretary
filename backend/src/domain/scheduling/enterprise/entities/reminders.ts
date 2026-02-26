import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/entities/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export type ReminderTypes = 'D1_REMINDER' | 'T2H_REMINDER' | 'T30M_REMINDER'

export interface ReminderProps {
  appointmentId: string
  type?: ReminderTypes | null
  sentAt: Date | null
  createdAt: Date | null
}

export class Reminders extends Entity<ReminderProps> {
  get appointmentId() {
    return this.props.appointmentId
  }

  get type() {
    return this.props.type || null
  }

  get sentAt() {
    return this.props.sentAt
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<ReminderProps, 'createdAt' | 'sentAt'>,
    id?: UniqueEntityId,
  ) {
    const reminder = new Reminders(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        sentAt: props.sentAt ?? null,
      },
      id,
    )

    return reminder
  }
}
