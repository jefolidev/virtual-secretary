import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Organization } from '@/domain/organization/enterprise/entities/organization'
import { CancellationPolicy } from '@/domain/scheduling/enterprise/entities/cancellation-policy'
import { GoogleCalendarToken } from '@/domain/scheduling/enterprise/entities/google-calendar-token'
import { ScheduleConfiguration } from '@/domain/scheduling/enterprise/entities/schedule-configuration'
import { UserProfessionalWithSettings } from '@/domain/scheduling/enterprise/entities/value-objects/user-professional-with-settings'
import { WorkingDaysList } from '@/domain/scheduling/enterprise/entities/value-objects/working-days-list'
import {
  CancellationPolicy as PrismaCancellationPolicy,
  GoogleCalendarToken as PrismaGoogleCalendarTokens,
  Organization as PrismaOrganization,
  Professional as PrismaProfessional,
  ScheduleConfiguration as PrismaScheduleConfiguration,
  User as PrismaUser,
} from '@prisma/client'

type PrismaUserProfessionalWithSettings = PrismaProfessional & {
  user: PrismaUser | null
  organization: PrismaOrganization | null
  cancellationPolicy: PrismaCancellationPolicy | null
  googleCalendarTokens: PrismaGoogleCalendarTokens | null
  scheduleConfiguration: PrismaScheduleConfiguration | null
}

export class PrismaUserProfessionalWithSettingsMapper {
  static toPrisma(professional: UserProfessionalWithSettings) {
    return {
      name: professional.name,
      email: professional.email,
      whatsappNumber: professional.whatsappNumber,
      organization: professional.organization,
      scheduleConfiguration: professional.scheduleConfiguration,
      cancellationPolicy: professional.cancellationPolicy,
      googleCalendarTokens: professional.googleCalendarTokens,
      sessionPrice: professional.sessionPrice,
      createdAt: professional.createdAt,
      updatedAt: professional.updatedAt,
    }
  }

  static toDomain(
    raw: PrismaUserProfessionalWithSettings,
  ): UserProfessionalWithSettings {
    if (!raw.user) {
      throw new Error('User entitie must be provided.')
    }

    let cancellationPolicy: CancellationPolicy | undefined = undefined

    if (raw.cancellationPolicy) {
      cancellationPolicy = CancellationPolicy.create(
        {
          allowReschedule: raw.cancellationPolicy.allowReschedule,
          cancelationFeePercentage: Number(
            raw.cancellationPolicy.cancellationFeePercentage,
          ),
          minDaysBeforeNextAppointment:
            raw.cancellationPolicy.minDaysBeforeNextAppointment,
          minHoursBeforeCancellation:
            raw.cancellationPolicy.minHoursBeforeCancellation,
          description: raw.cancellationPolicy.description,
          professionalId: new UniqueEntityId(raw.id),
          createdAt: raw.cancellationPolicy.createdAt,
          updatedAt: raw.cancellationPolicy.updatedAt || null,
        },
        new UniqueEntityId(raw.cancellationPolicy.id),
      )
    }

    let scheduleConfiguration: ScheduleConfiguration | undefined = undefined

    if (raw.scheduleConfiguration) {
      scheduleConfiguration = ScheduleConfiguration.create(
        {
          workingHours: {
            start: raw.scheduleConfiguration.workStartHour,
            end: raw.scheduleConfiguration.workEndHour,
          },
          enableGoogleMeet: raw.scheduleConfiguration.enableGoogleMeet,
          bufferIntervalMinutes:
            raw.scheduleConfiguration.bufferIntervalMinutes,
          holidays: raw.scheduleConfiguration.holidays,
          sessionDurationMinutes:
            raw.scheduleConfiguration.sessionDurationMinutes,
          workingDays: new WorkingDaysList(
            raw.scheduleConfiguration.workingDays,
          ),
          professionalId: new UniqueEntityId(raw.id),
          createdAt: raw.scheduleConfiguration.createdAt,
          updatedAt: raw.scheduleConfiguration.updatedAt || null,
        },
        new UniqueEntityId(raw.scheduleConfiguration.id),
      )
    }

    let organization: Organization | null = null

    if (raw.organization) {
      organization = Organization.create(
        {
          name: raw.organization.name,
          cnpj: raw.organization.cnpj,
          ownerId: new UniqueEntityId(raw.organization.ownerId),
          addressId: raw.organization.addressId
            ? new UniqueEntityId(raw.organization.addressId)
            : undefined,
          createdAt: raw.organization.createdAt,
          updatedAt: raw.organization.updatedAt || null,
        },
        new UniqueEntityId(raw.organization.id),
      )
    }

    let googleCalendarTokens: GoogleCalendarToken | undefined = undefined

    if (raw.googleCalendarTokens) {
      googleCalendarTokens = GoogleCalendarToken.create(
        {
          professionalId: raw.id,
          accessToken: raw.googleCalendarTokens.accessToken,
          refreshToken: raw.googleCalendarTokens.refreshToken,
          googleAccountEmail: raw.googleCalendarTokens.googleAccountEmail,
          scope: raw.googleCalendarTokens.scope,
          createdAt: raw.googleCalendarTokens.createdAt,
          updatedAt: raw.googleCalendarTokens.updatedAt || null,
        },
        new UniqueEntityId(raw.googleCalendarTokens.id),
      )
    }

    return UserProfessionalWithSettings.create({
      id: new UniqueEntityId(raw.id),
      name: raw.user.name,
      email: raw.user.email,
      whatsappNumber: raw.user.whatsappNumber,
      cancellationPolicy,
      googleCalendarTokens,
      scheduleConfiguration,
      organization,
      sessionPrice: Number(raw.sessionPrice),
      createdAt: raw.user.createdAt,
      updatedAt: raw.user.updatedAt || null,
    })
  }
}
