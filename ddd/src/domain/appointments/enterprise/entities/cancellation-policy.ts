import { Entity } from '@src/core/entities/entity'
import type { Optional } from '@src/core/entities/types/optional'
import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'

export interface CancellationPolicyProps {
  professionalId: UniqueEntityId
  minHoursBeforeCancellation: number
  minDaysBeforeNextAppointment: number
  cancelationFeePercentage: number
  allowReschedule: boolean
  description: string
  createdAt: Date
  updatedAt?: Date
}

export class CancellationPolicy extends Entity<CancellationPolicyProps> {
  get professionalId() {
    return this.props.professionalId
  }

  get minHoursBeforeCancellation() {
    return this.props.minHoursBeforeCancellation
  }

  get minDaysBeforeNextAppointment() {
    return this.props.minDaysBeforeNextAppointment
  }

  set minHoursBeforeCancellation(minHoursBeforeCancellation: number) {
    if (minHoursBeforeCancellation < 0) {
      throw new Error('minHoursBeforeCancellation must be greater than 0')
    }

    this.props.minHoursBeforeCancellation = minHoursBeforeCancellation
    this.touch()
  }

  get cancelationFeePercentage() {
    return this.props.cancelationFeePercentage
  }

  set cancelationFeePercentage(cancelationFeePercentage: number) {
    if (cancelationFeePercentage < 0) {
      throw new Error('cancelationFeePercentage must be greater than 0')
    }

    this.props.cancelationFeePercentage = cancelationFeePercentage
    this.touch()
  }

  get allowReschedule() {
    return this.props.allowReschedule
  }

  set allowReschedule(allowReschedule: boolean) {
    this.props.allowReschedule = allowReschedule
    this.touch()
  }

  get description() {
    return this.props.description
  }

  set description(description: string) {
    this.props.description = description
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
      CancellationPolicyProps,
      'createdAt' | 'minHoursBeforeCancellation'
    >,
    id?: UniqueEntityId
  ) {
    const cancellationPolicy = new CancellationPolicy(
      {
        ...props,
        minHoursBeforeCancellation: props.minHoursBeforeCancellation ?? 24,
        minDaysBeforeNextAppointment: props.minDaysBeforeNextAppointment ?? 6,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return cancellationPolicy
  }
}
