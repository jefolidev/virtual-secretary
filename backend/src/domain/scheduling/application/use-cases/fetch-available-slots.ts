import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import utc from 'dayjs/plugin/utc'
import type { Professional } from '../../enterprise/entities/professional'
import type { AppointmentsRepository } from '../repositories/appointments.repository'
import type { ProfessionalRepository } from '../repositories/professional-repository'
import type { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'
import { UniqueEntityId } from './../../../../core/entities/unique-entity-id'

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
      new UniqueEntityId(professionalId)
    )

    if (!professional) return left(new NotFoundError('Professional not found!'))

    const scheduleConfiguration =
      await this.scheduleConfiguration.findByProfessionalId(
        new UniqueEntityId(professional.id.toString())
      )

    if (!scheduleConfiguration)
      return left(new NotFoundError('Schedule configuration not found!'))

    const appointmentByProfessional =
      await this.appointmentRepository.findByProfessionalId(professional.id)

    const appointmentsInPeriod = appointmentByProfessional
      ? appointmentByProfessional.filter(
          (appointment) =>
            dayjs(appointment.startDateTime)
              .utc()
              .isSameOrAfter(dayjs(startDate).utc()) &&
            dayjs(appointment.endDateTime)
              .utc()
              .isSameOrBefore(dayjs(endDate).utc())
        )
      : []

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

    // Itera por cada dia no período - TRABALHANDO SEMPRE EM UTC
    let currentDate = dayjs(startDate).utc().startOf('day')
    const end = dayjs(endDate).utc().endOf('day')

    while (currentDate.isSameOrBefore(end)) {
      const dayOfWeek = currentDate.utc().day()

      // Verifica se é um dia de trabalho e não é feriado
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

        const workEnd = currentDate
          .utc()
          .hour(endHour!)
          .minute(endMinute!)
          .second(0)
          .millisecond(0)

        while (cursor.isBefore(workEnd)) {
          const slotStart = cursor
          const slotEnd = cursor.add(sessionDurationMinutes, 'minute')

          // Se o slot ultrapassar o horário de trabalho, para
          if (slotEnd.isAfter(workEnd)) {
            break
          }

          // LÓGICA DE CONFLITO CORRIGIDA - mais abrangente
          const isConflicting = appointmentsInPeriod.some((appointment) => {
            const appointmentStart = dayjs(appointment.startDateTime).utc()
            const appointmentEnd = dayjs(appointment.endDateTime).utc()

            // Conflito ocorre se há QUALQUER sobreposição
            return (
              // Appointment começa durante o slot (incluindo início exato)
              (appointmentStart.isSameOrAfter(slotStart) &&
                appointmentStart.isBefore(slotEnd)) ||
              // Appointment termina durante o slot (incluindo fim exato)
              (appointmentEnd.isAfter(slotStart) &&
                appointmentEnd.isSameOrBefore(slotEnd)) ||
              // Appointment cobre completamente o slot
              (appointmentStart.isSameOrBefore(slotStart) &&
                appointmentEnd.isSameOrAfter(slotEnd)) ||
              // Slot cobre completamente o appointment
              (slotStart.isSameOrBefore(appointmentStart) &&
                slotEnd.isSameOrAfter(appointmentEnd))
            )
          })

          if (!isConflicting) {
            allSlots.push({
              startDate: slotStart.toDate(),
              endDate: slotEnd.toDate(),
            })
          }

          // Avança para o próximo slot (sessão + buffer)
          cursor = slotEnd.add(bufferIntervalMinutes, 'minute')
        }
      }

      currentDate = currentDate.add(1, 'day')
    }

    return right({ professional, slots: allSlots })
  }
}
