import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { OnAppointmentCanceled } from './../../domain/notifications/application/subscribers/on-appointment-canceled'
import { OnAppointmentConfirmed } from './../../domain/notifications/application/subscribers/on-appointment-confirmed'
import { OnAppointmentScheduled } from './../../domain/notifications/application/subscribers/on-appointment-scheduled'
import { OnProfessionalAddedToOrganization } from './../../domain/notifications/application/subscribers/on-professional-added-in-organization'
import { OnProfessionalRemovedFromOrganization } from './../../domain/notifications/application/subscribers/on-professional-removed-in-organization'
import { SendNotificationUseCase } from './../../domain/notifications/application/use-cases/send-notification'
import { OnAppointmentFinished } from '@/domain/evaluation/application/subcribers/on-appointment-finished'

@Module({
  imports: [DatabaseModule],
  providers: [
    OnAppointmentScheduled,
    OnAppointmentCanceled,
    OnAppointmentConfirmed,
    OnAppointmentFinished,
    OnProfessionalAddedToOrganization,
    OnProfessionalRemovedFromOrganization,
    SendNotificationUseCase,
  ],
})
export class EventsModule {}
