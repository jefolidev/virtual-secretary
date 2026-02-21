import { AggregateRoot } from '@/core/entities/aggregate'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface EvaluationProps {
  appointmentId: string
  professionalId: string

  score: number
  comment?: string
  createdAt: Date
}

export class Evaluation extends AggregateRoot<EvaluationProps> {
  get appointmentId(): string {
    return this.props.appointmentId
  }

  get professionalId(): string {
    return this.props.professionalId
  }

  get score(): number {
    return this.props.score
  }

  get comment(): string | undefined {
    return this.props.comment
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(
    props: Omit<EvaluationProps, 'createdAt'>,
    id?: UniqueEntityId,
  ): Evaluation {
    const evaluation = new Evaluation({
      ...props,
      createdAt: new Date(),
    }, id)

    return evaluation
  }
}
