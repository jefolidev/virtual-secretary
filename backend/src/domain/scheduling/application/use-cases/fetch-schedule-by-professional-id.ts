import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { AppointmentWithClient } from '../../enterprise/entities/value-objects/appointment-with-client'
import { AppointmentsRepository } from '../repositories/appointments.repository'

export type FetchScheduleByProfessionalIdStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'AWAITING_SCORE'
  | 'AWAITING_COMMENT'
  | 'all'

export type FetchScheduleByProfessionalIdPaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'all'

export type FetchScheduleByProfessionalIdPeriod =
  | 'last-year'
  | 'last-month'
  | 'last-week'
  | 'all'
export type FetchScheduleByProfessionalIdModality =
  | 'IN_PERSON'
  | 'ONLINE'
  | 'all'

export type FetchScheduleByProfesionalIdFilters = {
  period: FetchScheduleByProfessionalIdPeriod
  status: FetchScheduleByProfessionalIdStatus
  paymentStatus: FetchScheduleByProfessionalIdPaymentStatus
  modality: FetchScheduleByProfessionalIdModality
}

export interface FetchScheduleByProfessionalIdUseCaseProps {
  professionalId: string
  page?: number
  filters?: FetchScheduleByProfesionalIdFilters
}

type FetchScheduleByProfessionalIdUseCaseResponse = Either<
  NotFoundError,
  { appointments: AppointmentWithClient[]; pages: number }
>

@Injectable()
export class FetchScheduleByProfessionalIdUseCase {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  async execute({
    professionalId,
    page = 1,
    filters = {
      period: 'all',
      status: 'all',
      paymentStatus: 'all',
      modality: 'all',
    },
  }: FetchScheduleByProfessionalIdUseCaseProps): Promise<FetchScheduleByProfessionalIdUseCaseResponse> {
    const appointments =
      await this.appointmentsRepository.findManyByProfessionalId(
        professionalId,
        { page },
        filters,
      )

    const total =
      await this.appointmentsRepository.countAppointmentsByProfessionalId(
        professionalId,
        filters,
      )

    const pageSize = 5

    return right({ appointments, pages: Math.ceil(total / pageSize) })
  }
}
