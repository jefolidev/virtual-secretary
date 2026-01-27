import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ScheduleConfiguration } from '@/domain/scheduling/enterprise/entities/schedule-configuration'
import { WorkingDaysList } from '@/domain/scheduling/enterprise/entities/value-objects/working-days-list'
import { ScheduleConfiguration as PrismaScheduleConfiguration } from '../../generated/prisma/index'

export class PrismaScheduleConfigurationMapper {
  static toPrisma(
    scheduleConfig: ScheduleConfiguration,
  ): PrismaScheduleConfiguration {
    return {
      id: scheduleConfig.id.toString(),
      workingDays: scheduleConfig.workingDays.getItems(),
      workStartHour: scheduleConfig.workingHours.start,
      workEndHour: scheduleConfig.workingHours.end,
      holidays: scheduleConfig.holidays,
      enableGoogleMeet: scheduleConfig.enableGoogleMeet,
      professionalId: scheduleConfig.professionalId?.toString(),
      sessionDurationMinutes: scheduleConfig.sessionDurationMinutes,
      bufferIntervalMinutes: scheduleConfig.bufferIntervalMinutes,
      createdAt: scheduleConfig.createdAt,
      updatedAt: scheduleConfig.updatedAt,
    }
  }

  static toDomain(raw: PrismaScheduleConfiguration): ScheduleConfiguration {
    const workingDaysDomain = new WorkingDaysList(raw.workingDays || [])

    return ScheduleConfiguration.create(
      {
        workingDays: workingDaysDomain,
        workingHours: { start: raw.workStartHour, end: raw.workEndHour },
        holidays: raw.holidays || [],
        enableGoogleMeet: raw.enableGoogleMeet,
        professionalId: new UniqueEntityId(raw.professionalId),
        sessionDurationMinutes: raw.sessionDurationMinutes,
        bufferIntervalMinutes: raw.bufferIntervalMinutes,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt || null,
      },
      new UniqueEntityId(raw.id),
    )
  }
}
