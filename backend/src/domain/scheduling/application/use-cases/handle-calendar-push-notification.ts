import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Either, left, right } from '@/core/either'
import { Notification } from '@/domain/notifications/enterprise/entities/notification'
import { NotificationsRepository } from '@/domain/notifications/application/repositories/notification.repository'
import { Injectable } from '@nestjs/common'
import { AppointmentsRepository } from '../repositories/appointments.repository'
import { GoogleCalendarEventRepository } from '../repositories/google-calendar-event.repository'
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token.repository'
import { UserRepository } from '../repositories/user.repository'

export interface HandleCalendarPushNotificationUseCaseRequest {
  channelId: string
  resourceState: string
}

export type HandleCalendarPushNotificationUseCaseResponse = Either<string, void>

@Injectable()
export class HandleCalendarPushNotificationUseCase {
  constructor(
    private tokenRepository: GoogleCalendarTokenRepository,
    private calendarEventRepository: GoogleCalendarEventRepository,
    private appointmentsRepository: AppointmentsRepository,
    private notificationsRepository: NotificationsRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    channelId,
    resourceState,
  }: HandleCalendarPushNotificationUseCaseRequest): Promise<HandleCalendarPushNotificationUseCaseResponse> {
    if (resourceState === 'sync') {
      // Initial handshake — no action needed
      return right(undefined)
    }

    if (resourceState !== 'exists') {
      return right(undefined)
    }

    const tokenRecord = await this.tokenRepository.findByChannelId(channelId)

    if (!tokenRecord || !tokenRecord.syncToken) {
      console.warn(`[PushNotif] Channel not found or missing syncToken for channelId=${channelId}`)
      return left('Channel not found or missing sync token')
    }

    const { professionalId, syncToken } = tokenRecord
    console.log(`[PushNotif] Processing for professionalId=${professionalId}`)

    let changes: Awaited<
      ReturnType<GoogleCalendarEventRepository['listChangedEvents']>
    >

    try {
      changes = await this.calendarEventRepository.listChangedEvents(
        professionalId,
        syncToken,
      )
    } catch (error: any) {
      // 410 Gone means syncToken is invalid — full resync needed
      if (error?.response?.status === 410 || error?.code === 410) {
        console.warn(
          `[HandleCalendarPushNotification] Sync token expired for professional ${professionalId}, skipping this notification`,
        )
        return left('Sync token expired')
      }
      throw error
    }

    console.log(`[PushNotif] Changes received: ${changes.changes.length}`, JSON.stringify(changes.changes))

    await this.tokenRepository.updateSyncToken(
      professionalId,
      changes.nextSyncToken,
    )

    for (const change of changes.changes) {
      console.log(`[PushNotif] Processing change: googleEventId=${change.googleEventId} status=${change.status} start=${change.startDateTime}`)

      const calendarEvent =
        await this.calendarEventRepository.findByGoogleEventId(
          change.googleEventId,
        )

      if (!calendarEvent) {
        console.log(`[PushNotif] No calendarEvent found for googleEventId=${change.googleEventId} — skipping`)
        continue
      }

      const appointment = await this.appointmentsRepository.findById(
        calendarEvent.appointmentId.toString(),
      )

      if (!appointment) {
        console.log(`[PushNotif] No appointment found for calendarEvent appointmentId=${calendarEvent.appointmentId}`)
        continue
      }

      if (change.status === 'cancelled') {
        if (!appointment.isCancelled()) {
          appointment.cancel()
          await this.appointmentsRepository.save(appointment)
          console.log(`[PushNotif] Appointment ${appointment.id} cancelled`)

          const professionalUser = await this.userRepository.findByProfessionalId(
            appointment.professionalId.toString(),
          )
          console.log(`[PushNotif] professionalId=${appointment.professionalId} user=${professionalUser?.id?.toString() ?? 'NOT_FOUND'}`)
          if (professionalUser) {
            const recipientId = professionalUser.id.toString()
            console.log(`[PushNotif] Creating notification for recipientId=${recipientId}`)
            const notification = Notification.create({
              recipientId: new UniqueEntityId(recipientId),
              title: 'Consulta cancelada via Google Calendar',
              content: 'Uma consulta foi cancelada diretamente no Google Calendar e foi atualizada no sistema.',
              reminderType: 'CALENDAR_SYNC_CANCELLED',
            })
            await this.notificationsRepository.create(notification)
          }
        }
        continue
      }

      if (change.startDateTime && change.endDateTime) {
        const newStart = new Date(change.startDateTime)
        const newEnd = new Date(change.endDateTime)

        const effectiveStart = appointment.effectiveStartDateTime
        const effectiveEnd = appointment.effectiveEndDateTime

        console.log(`[PushNotif] Time comparison — effectiveStart=${effectiveStart.toISOString()} newStart=${newStart.toISOString()}`)

        const startChanged =
          Math.abs(newStart.getTime() - effectiveStart.getTime()) > 60_000
        const endChanged =
          Math.abs(newEnd.getTime() - effectiveEnd.getTime()) > 60_000

        console.log(`[PushNotif] startChanged=${startChanged} endChanged=${endChanged}`)

        if (startChanged || endChanged) {
          appointment.syncFromGoogleCalendar({ start: newStart, end: newEnd })
          await this.appointmentsRepository.save(appointment)

          // Keep calendarEvent DB record in sync (no Google API call)
          calendarEvent.startDateTime = newStart
          calendarEvent.endDateTime = newEnd
          await this.calendarEventRepository.save(calendarEvent)
          console.log(`[PushNotif] Appointment ${appointment.id} updated to start=${newStart.toISOString()}`)

          const professionalUser = await this.userRepository.findByProfessionalId(
            appointment.professionalId.toString(),
          )
          if (professionalUser) {
            const notification = Notification.create({
              recipientId: new UniqueEntityId(professionalUser.id.toString()),
              title: 'Consulta reagendada via Google Calendar',
              content: `Uma consulta foi reagendada diretamente no Google Calendar para ${newStart.toLocaleString('pt-BR')}.`,
              reminderType: 'CALENDAR_SYNC_UPDATED',
            })
            await this.notificationsRepository.create(notification)
          }
        }
      }
    }

    return right(undefined)
  }
}
