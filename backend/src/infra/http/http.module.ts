import { GetEvaluationStatsUseCase } from '@/domain/evaluation/application/use-case/get-evaluation-stats'
import { FetchProfessionalNotificationsUseCase } from '@/domain/notifications/application/use-cases/fetch-professional-notifications'
import { ReadNotificationUseCase } from '@/domain/notifications/application/use-cases/read-notification'
import { AddProfessionalToOrganizationUseCase } from '@/domain/organization/application/use-cases/add-professional-to-organization'
import { CreateOrganizationUseCase } from '@/domain/organization/application/use-cases/create-organization'
import { FetchOrganizationByIdUseCase } from '@/domain/organization/application/use-cases/fetch-organization-by-id'
import { RemoveProfessionalFromOrganizationUseCase } from '@/domain/organization/application/use-cases/remove-professional-from-organization'
import { UpdateOrganizationUseCase } from '@/domain/organization/application/use-cases/update-organization'
import { FetchTransactionByAppointmentIdUseCase } from '@/domain/payments/application/use-case/fetch-transaction-by-appointment-id'
import { InitiateNewTransactionUseCase } from '@/domain/payments/application/use-case/initiate-new-transaction'
import { AuthenticateStudentUseCase } from '@/domain/scheduling/application/use-cases/authenticate-user'
import { CancelAppointmentUseCase } from '@/domain/scheduling/application/use-cases/cancel-appointment'
import { ChangeProfessionalWorkDaysUseCase } from '@/domain/scheduling/application/use-cases/change-professional-work-days'
import { ChangeProfessionalWorkHoursUseCase } from '@/domain/scheduling/application/use-cases/change-professional-work-hours'
import { CompleteAppointmentUseCase } from '@/domain/scheduling/application/use-cases/complete-appointment'
import { ConfirmAppointmentUseCase } from '@/domain/scheduling/application/use-cases/confirm-appointment'
import { CreateAddressUseCase } from '@/domain/scheduling/application/use-cases/create-address'
import { CreateCancellationPolicyUseCase } from '@/domain/scheduling/application/use-cases/create-cancellation-policy'
import { CreateClientUseCase } from '@/domain/scheduling/application/use-cases/create-client'
import { CreateProfessionalUseCase } from '@/domain/scheduling/application/use-cases/create-professional'
import { CreateAppointmentUseCase } from '@/domain/scheduling/application/use-cases/create-schedule'
import { CreateScheduleConfigurationUseCase } from '@/domain/scheduling/application/use-cases/create-schedule-configuration'
import { EditCancellationPolicyUseCase } from '@/domain/scheduling/application/use-cases/edit-cancellation-policy'
import { EditClientUseCase } from '@/domain/scheduling/application/use-cases/edit-client'
import { EditProfessionalUseCase } from '@/domain/scheduling/application/use-cases/edit-professional'
import { EditScheduleConfigurationUseCase } from '@/domain/scheduling/application/use-cases/edit-schedule-configuration'
import { EditUserUseCase } from '@/domain/scheduling/application/use-cases/edit-user'
import { FetchAvailableSlotsUseCase } from '@/domain/scheduling/application/use-cases/fetch-available-slots'
import { FetchClientsUseCase } from '@/domain/scheduling/application/use-cases/fetch-client'
import { FetchProfessionalUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional'
import { FetchProfessionalWithNotificationSettingsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-notification-settings'
import { FetchProfessionalScheduleSettingsUseCase } from '@/domain/scheduling/application/use-cases/fetch-professional-schedule-settings'
import { FetchScheduleByClientIdUseCase } from '@/domain/scheduling/application/use-cases/fetch-schedule-by-client-id'
import { FetchScheduleByProfessionalIdUseCase } from '@/domain/scheduling/application/use-cases/fetch-schedule-by-professional-id'
import { FetchUsersContactsUseCase } from '@/domain/scheduling/application/use-cases/fetch-users-contacts.use-case'
import { ForgotPasswordUseCase } from '@/domain/scheduling/application/use-cases/forgot-password'
import { HandleOAuthCallbackUseCase } from '@/domain/scheduling/application/use-cases/handle-oauth-callback'
import { LogoutUseCase } from '@/domain/scheduling/application/use-cases/logout'
import { PauseAppointmentUseCase } from '@/domain/scheduling/application/use-cases/pause-appointment'
import { RegisterCalendarWatchUseCase } from '@/domain/scheduling/application/use-cases/register-calendar-watch'
import { RegisterUserUseCase } from '@/domain/scheduling/application/use-cases/register-user'
import { RescheduleAppointmentUseCase } from '@/domain/scheduling/application/use-cases/reschedule-appointment'
import { StartAppointmentUseCase } from '@/domain/scheduling/application/use-cases/start-appointment'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { GoogleOAuthCallbackController } from '../webhooks/google-calendar/controllers/handle-oauth-callback.controller'
import { MercadoPagoModule } from '../webhooks/mercado-pago/mercado-pago.module'
import { AddProfessionalToOrganizationController } from './controllers/add-professional-to-organization.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CancelAppointmentController } from './controllers/cancel-appointment.controller'
import { CompleteAppointmentController } from './controllers/complete-appointment.controller'
import { ConfirmAppointmentController } from './controllers/confirm-appointment.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateCancellationPolicyController } from './controllers/create-cancellation-pollicy.controller'
import { CreateOrganizationController } from './controllers/create-organization.controller'
import { CreateScheduleConfigurationController } from './controllers/create-schedule-configuration.controller'
import { CreateScheduleController } from './controllers/create-schedule.controller'
import { EditCancellationPolicyController } from './controllers/edit-cancellation-policy.controller'
import { EditClientController } from './controllers/edit-client.controller'
import { EditProfessionalWorkDaysController } from './controllers/edit-professional-work-days.controller'
import { EditProfessionalWorkHoursController } from './controllers/edit-professional-work-hours.controller'
import { EditProfessionalController } from './controllers/edit-professional.controller'
import { EditScheduleConfigurationController } from './controllers/edit-schedule-configuration.controller'
import { EditUserController } from './controllers/edit-user.controller'
import { FetchAppointmentsByClientController } from './controllers/fetch-appointments-by-client.controller'
import { FetchAppointmentsByProfessionalController } from './controllers/fetch-appointments-by-professional.controller'
import { FetchAvailableProfessionalSlotsController } from './controllers/fetch-available-slots.controller'
import { FetchClientController } from './controllers/fetch-clients.controller'
import { FetchOrganizationByIdController } from './controllers/fetch-organization-by-id.controller'
import { FetchOrganizationController } from './controllers/fetch-organizations.controller'
import { FetchProfessionalWithNotificationSettingsController } from './controllers/fetch-professional-notification-settings.controller'
import { FetchProfessionalNotificationsController } from './controllers/fetch-professional-notifications.controller'
import { FetchProfessionalSettingsController } from './controllers/fetch-professional-settings.controller'
import { FetchProfessionalController } from './controllers/fetch-professionals.controller'
import { FetchTransactionByAppointmentController } from './controllers/fetch-transaction-by-appointment.controller'
import { FetchUsersContactsController } from './controllers/fetch-users-contacts.controller'
import { ForgotPasswordController } from './controllers/forgot-password.controller'
import { GetEvaluationStatsController } from './controllers/get-evaluation-stats.controller'
import { GoogleOAuthInitController } from './controllers/google-oauth-init.controller'
import { LogoutController } from './controllers/logout.controller'
import { MeController } from './controllers/me.controller'
import { MercadoPagoAccountController } from './controllers/mercado-pago-account.controller'
import { MercadoPagoOAuthCallbackController } from './controllers/mercado-pago-oauth-callback.controller'
import { MercadoPagoOAuthInitController } from './controllers/mercado-pago-oauth-init.controller'
import { PauseAppointmentController } from './controllers/pause-appointment.controller'
import { ReadNotificationController } from './controllers/read-notification.controller'
import { RemoveProfessionalFromOrganizationController } from './controllers/remove-professional-from-organization.controller'
import { RescheduleAppointmentController } from './controllers/reschedule-appointment.controller'
import { StartAppointmentController } from './controllers/start-appointment.controller'
import { UpdateOrganizationController } from './controllers/update-organization.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule, MercadoPagoModule],
  controllers: [
    AddProfessionalToOrganizationController,
    AuthenticateController,
    CancelAppointmentController,
    CompleteAppointmentController,
    ConfirmAppointmentController,
    CreateAccountController,
    CreateCancellationPolicyController,
    CreateScheduleController,
    CreateScheduleConfigurationController,
    CreateOrganizationController,
    EditCancellationPolicyController,
    EditClientController,
    EditProfessionalController,
    EditProfessionalWorkDaysController,
    EditProfessionalWorkHoursController,
    EditUserController,
    EditScheduleConfigurationController,
    FetchAvailableProfessionalSlotsController,
    FetchAppointmentsByClientController,
    FetchAppointmentsByProfessionalController,
    FetchClientController,
    FetchOrganizationController,
    FetchOrganizationByIdController,
    FetchProfessionalController,
    FetchProfessionalNotificationsController,
    FetchProfessionalSettingsController,
    FetchProfessionalWithNotificationSettingsController,
    ForgotPasswordController,
    GetEvaluationStatsController,
    GoogleOAuthCallbackController,
    GoogleOAuthInitController,
    LogoutController,
    MeController,
    MercadoPagoAccountController,
    MercadoPagoOAuthCallbackController,
    MercadoPagoOAuthInitController,
    PauseAppointmentController,
    ReadNotificationController,
    RemoveProfessionalFromOrganizationController,
    RescheduleAppointmentController,
    StartAppointmentController,
    UpdateOrganizationController,
    FetchUsersContactsController,
    FetchTransactionByAppointmentController,
  ],
  providers: [
    AddProfessionalToOrganizationUseCase,
    AuthenticateStudentUseCase,
    CancelAppointmentUseCase,
    ChangeProfessionalWorkDaysUseCase,
    ChangeProfessionalWorkHoursUseCase,
    CompleteAppointmentUseCase,
    ConfirmAppointmentUseCase,
    CreateAddressUseCase,
    CreateAppointmentUseCase,
    CreateCancellationPolicyUseCase,
    CreateClientUseCase,
    CreateOrganizationUseCase,
    CreateProfessionalUseCase,
    CreateScheduleConfigurationUseCase,
    EditCancellationPolicyUseCase,
    EditClientUseCase,
    EditProfessionalUseCase,
    EditUserUseCase,
    EditScheduleConfigurationUseCase,
    FetchAvailableSlotsUseCase,
    FetchClientsUseCase,
    FetchOrganizationByIdUseCase,
    FetchProfessionalNotificationsUseCase,
    FetchProfessionalUseCase,
    FetchProfessionalWithNotificationSettingsUseCase,
    FetchProfessionalScheduleSettingsUseCase,
    FetchScheduleByClientIdUseCase,
    FetchScheduleByProfessionalIdUseCase,
    GetEvaluationStatsUseCase,
    ForgotPasswordUseCase,
    HandleOAuthCallbackUseCase,
    LogoutUseCase,
    PauseAppointmentUseCase,
    ReadNotificationUseCase,
    RegisterCalendarWatchUseCase,
    RegisterUserUseCase,
    RemoveProfessionalFromOrganizationUseCase,
    RescheduleAppointmentUseCase,
    StartAppointmentUseCase,
    UpdateOrganizationUseCase,
    FetchUsersContactsUseCase,
    InitiateNewTransactionUseCase,
    FetchTransactionByAppointmentIdUseCase,
  ],
})
export class HttpModule {}
