import { AddProfessionalToOrganizationUseCase } from '@/domain/organization/application/use-cases/add-professional-to-organization'
import { CreateOrganizationUseCase } from '@/domain/organization/application/use-cases/create-organization'
import { FetchOrganizationByIdUseCase } from '@/domain/organization/application/use-cases/fetch-organization-by-id'
import { RemoveProfessionalFromOrganizationUseCase } from '@/domain/organization/application/use-cases/remove-professional-from-organization'
import { UpdateOrganizationUseCase } from '@/domain/organization/application/use-cases/update-organization'
import { AuthenticateStudentUseCase } from '@/domain/scheduling/application/use-cases/authenticate-user'
import { CancelAppointmentUseCase } from '@/domain/scheduling/application/use-cases/cancel-appointment'
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
import { ForgotPasswordUseCase } from '@/domain/scheduling/application/use-cases/forgot-password'
import { LogoutUseCase } from '@/domain/scheduling/application/use-cases/logout'
import { PauseAppointmentUseCase } from '@/domain/scheduling/application/use-cases/pause-appointment'
import { RegisterUserUseCase } from '@/domain/scheduling/application/use-cases/register-user'
import { RescheduleAppointmentUseCase } from '@/domain/scheduling/application/use-cases/reschedule-appointment'
import { StartAppointmentUseCase } from '@/domain/scheduling/application/use-cases/start-appointment'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
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
import { FetchProfessionalSettingsController } from './controllers/fetch-professional-settings.controller'
import { FetchProfessionalController } from './controllers/fetch-professionals.controller'
import { ForgotPasswordController } from './controllers/forgot-password.controller'
import { LogoutController } from './controllers/logout.controller'
import { MeController } from './controllers/me.controller'
import { PauseAppointmentController } from './controllers/pause-appointment.controller'
import { RemoveProfessionalFromOrganizationController } from './controllers/remove-professional-from-organization.controller'
import { RescheduleAppointmentController } from './controllers/reschedule-appointment.controller'
import { StartAppointmentController } from './controllers/start-appointment.controller'
import { UpdateOrganizationController } from './controllers/update-organization.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
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
    EditUserController,
    EditScheduleConfigurationController,
    FetchAvailableProfessionalSlotsController,
    FetchAppointmentsByClientController,
    FetchAppointmentsByProfessionalController,
    FetchClientController,
    FetchOrganizationController,
    FetchOrganizationByIdController,
    FetchProfessionalController,
    FetchProfessionalSettingsController,
    FetchProfessionalWithNotificationSettingsController,
    ForgotPasswordController,
    LogoutController,
    MeController,
    PauseAppointmentController,
    RemoveProfessionalFromOrganizationController,
    RescheduleAppointmentController,
    StartAppointmentController,
    UpdateOrganizationController,
  ],
  providers: [
    AddProfessionalToOrganizationUseCase,
    AuthenticateStudentUseCase,
    CancelAppointmentUseCase,
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
    FetchProfessionalUseCase,
    FetchProfessionalWithNotificationSettingsUseCase,
    FetchProfessionalScheduleSettingsUseCase,
    FetchScheduleByClientIdUseCase,
    FetchScheduleByProfessionalIdUseCase,
    ForgotPasswordUseCase,
    LogoutUseCase,
    PauseAppointmentUseCase,
    RegisterUserUseCase,
    RemoveProfessionalFromOrganizationUseCase,
    RescheduleAppointmentUseCase,
    StartAppointmentUseCase,
    UpdateOrganizationUseCase,
  ],
})
export class HttpModule {}
