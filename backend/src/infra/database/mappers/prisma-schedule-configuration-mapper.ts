import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ScheduleConfiguration } from '@/domain/scheduling/enterprise/entities/schedule-configuration'
import { WorkingDaysList } from '@/domain/scheduling/enterprise/entities/value-objects/working-days-list'
import { ScheduleConfiguration as PrismaScheduleConfiguration } from '@prisma/generated/client'

export class PrismaScheduleConfigurationMapper {
  static toDomain(raw: PrismaScheduleConfiguration): ScheduleConfiguration {
    const rawWorkingDays = raw.workingDays || []

    const numericWorkingDays = rawWorkingDays.map(mapPrismaWeekDayToNumber)

    const workingDaysDomain = new WorkingDaysList(numericWorkingDays)

    return ScheduleConfiguration.create(
      {
        workingDays: workingDaysDomain,
        workingHours: { start: raw.workStartHour, end: raw.workEndHour },
        holidays: raw.holidays || [],
        enableGoogleMeet: raw.enableGoogleMeet,
        professionalId: undefined,
        sessionDurationMinutes: raw.sessionDurationMinutes,
        bufferIntervalMinutes: raw.bufferIntervalMinutes,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt || null,
      },
      new UniqueEntityId(raw.id)
    )
  }
}

function mapPrismaWeekDayToNumber(prismaDay): number {
  switch (prismaDay) {
    case 'SUNDAY':
      return 0
    case 'MONDAY':
      return 1
    case 'TUESDAY':
      return 2
    case 'WEDNESDAY':
      return 3
    case 'THURSDAY':
      return 4
    case 'FRIDAY':
      return 5
    case 'SATURDAY':
      return 6
    default:
      throw new Error(`Dia da semana inválido: ${prismaDay}`)
  }
}
