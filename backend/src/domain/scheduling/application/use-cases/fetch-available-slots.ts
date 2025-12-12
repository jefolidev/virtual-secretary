import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import utc from 'dayjs/plugin/utc'
import { Professional } from '../../enterprise/entities/professional'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export interface FetchAvailableSlotsUseCaseRequest {
  professionalId: string
  startDate: Date
  endDate: Date
}

export type FetchAvailableSlotsUseCaseResponse = Either<
  NotFoundError,
  {
    professional: Professional
    slots: { startDate: Date; endDate: Date }[]
  }
>

@Injectable()
export class FetchAvailableSlotsUseCase {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly scheduleConfiguration: ScheduleConfigurationRepository,
    private readonly appointmentRepository: AppointmentsRepository
  ) {}

  async execute({
    professionalId,
    startDate,
    endDate,
  }: FetchAvailableSlotsUseCaseRequest): Promise<FetchAvailableSlotsUseCaseResponse> {
    const professional = await this.professionalRepository.findById(
      professionalId
    )

    if (!professional) return left(new NotFoundError('Professional not found!'))

    const scheduleConfiguration =
      await this.scheduleConfiguration.findByProfessionalId(
        professional.id.toString()
      )

    if (!scheduleConfiguration)
      return left(new NotFoundError('Schedule configuration not found!'))

    // Vamos calcular por dia e buscar conflitos apenas do profissional

    const {
      workingDays,
      workingHours,
      sessionDurationMinutes,
      bufferIntervalMinutes,
      holidays,
    } = scheduleConfiguration

    const [startHour, startMinute] = workingHours.start.split(':').map(Number)
    const [endHour, endMinute] = workingHours.end.split(':').map(Number)

    const allSlots: { startDate: Date; endDate: Date }[] = []

    let currentDate = dayjs(startDate).utc().startOf('day')
    const end = dayjs(endDate).utc()

    while (currentDate.isSameOrBefore(end)) {
      const dayOfWeek = currentDate.utc().day()

      const isWorkingDay = workingDays.currentItems.includes(dayOfWeek)
      const isHoliday = holidays.some((holiday) =>
        dayjs(holiday).utc().isSame(currentDate, 'day')
      )

      if (isWorkingDay && !isHoliday) {
        let cursor = currentDate
          .utc()
          .hour(startHour!)
          .minute(startMinute!)
          .second(0)
          .millisecond(0)

        let workEnd = currentDate
          .utc()
          .hour(endHour!)
          .minute(endMinute!)
          .second(0)
          .millisecond(0)

        // Limita o fim do trabalho ao fim do período solicitado, se for o mesmo dia
        if (workEnd.isSame(end, 'day') && workEnd.isAfter(end)) {
          workEnd = end.clone()
        }

        // Busca consultas do profissional para o intervalo diário inteiro
        const dayStart = currentDate
          .utc()
          .hour(startHour!)
          .minute(startMinute!)
          .second(0)
          .millisecond(0)
        const dayEnd = workEnd.clone()
        const appointmentsInPeriod =
          await this.appointmentRepository.findOverlapping(
            professional.id.toString(),
            dayStart.toDate(),
            dayEnd.toDate()
          )

        while (cursor.isBefore(workEnd)) {
          const slotStart = cursor
          const slotEnd = cursor.add(sessionDurationMinutes, 'minute')

          // Se o slot ultrapassar o horário de trabalho, para
          if (slotEnd.isAfter(workEnd)) {
            break
          }

          const isConflicting = appointmentsInPeriod.some((appointment) => {
            const appointmentStart = dayjs(
              appointment.effectiveStartDateTime
            ).utc()
            const appointmentEnd = dayjs(appointment.effectiveEndDateTime).utc()

            // Sobreposição direta: início do slot < fim da consulta E fim do slot > início da consulta
            return (
              slotStart.isBefore(appointmentEnd) &&
              slotEnd.isAfter(appointmentStart)
            )
          })

          if (!isConflicting) {
            allSlots.push({
              startDate: slotStart.toDate(),
              endDate: slotEnd.toDate(),
            })
          }

          cursor = slotEnd.add(bufferIntervalMinutes, 'minute')
        }
      }

      currentDate = currentDate.add(1, 'day')
    }

    return right({ professional, slots: allSlots })
  }
}
