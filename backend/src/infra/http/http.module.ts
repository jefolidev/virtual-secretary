import { AddProfessionalToOrganizationUseCase } from '@/domain/organization/application/use-cases/add-professional-to-organization'
import { CreateOrganizationUseCase } from '@/domain/organization/application/use-cases/create-organization'
import { FetchOrganizationByIdUseCase } from '@/domain/organization/application/use-cases/fetch-organization-by-id'
import { RemoveProfessionalFromOrganizationUseCase } from '@/domain/organization/application/use-cases/remove-professional-from-organization'
import { UpdateOrganizationUseCase } from '@/domain/organization/application/use-cases/update-organization'
import { AuthenticateStudentUseCase } from '@/domain/scheduling/application/use-cases/authenticate-user'
import { CancelAppointmentUseCase } from '@/domain/scheduling/application/use-cases/cancel-appointment'
import { CreateAddressUseCase } from '@/domain/scheduling/application/use-cases/create-address'
import { CreateCancellationPolicyUseCase } from '@/domain/scheduling/application/use-cases/create-cancellation-policy'
import { CreateClientUseCase } from '@/domain/scheduling/application/use-cases/create-client'
import { CreateProfessionalUseCase } from '@/domain/scheduling/application/use-cases/create-professional'
import { CreateAppointmentUseCase } from '@/domain/scheduling/application/use-cases/create-schedule'
import { CreateScheduleConfigurationUseCase } from '@/domain/scheduling/application/use-cases/create-schedule-configuration'
import { FetchClientsUseCase } from '@/domain/scheduling/application/use-cases/fetch-client'
import { ForgotPasswordUseCase } from '@/domain/scheduling/application/use-cases/forgot-password'
import { RegisterUserUseCase } from '@/domain/scheduling/application/use-cases/register-user'
import { RescheduleAppointmentUseCase } from '@/domain/scheduling/application/use-cases/reschedule-appointment'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AddProfessionalToOrganizationController } from './controllers/add-professional-to-organization.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CancelAppointmentController } from './controllers/cancel-appointment.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateCancellationPolicyController } from './controllers/create-cancellation-pollicy.controller'
import { CreateOrganizationController } from './controllers/create-organization.controller'
import { CreateScheduleConfigurationController } from './controllers/create-schedule-configuration.controller'
import { CreateScheduleController } from './controllers/create-schedule.controller'
import { FetchClientController } from './controllers/fetch-clients.controller'
import { FetchOrganizationByIdController } from './controllers/fetch-organization-by-id.controller'
import { FetchOrganizationController } from './controllers/fetch-organizations.controller'
import { FetchProfessionalController } from './controllers/fetch-professionals.controller'
import { ForgotPasswordController } from './controllers/forgot-password.controller'
import { RemoveProfessionalFromOrganizationController } from './controllers/remove-professional-from-organization.controller'
import { RescheduleAppointmentController } from './controllers/reschedule-appointment.controller'
import { UpdateOrganizationController } from './controllers/update-organization.controller'
import { ConfirmAppointmentUseCase } from '@/domain/scheduling/application/use-cases/confirm-appointment'
import { ConfirmAppointmentController } from './controllers/confirm-appointment.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    AddProfessionalToOrganizationController,
    AuthenticateController,
    CancelAppointmentController,
    ConfirmAppointmentController,
    CreateAccountController,
    CreateCancellationPolicyController,
    CreateScheduleController,
    CreateScheduleConfigurationController,
    CreateOrganizationController,
    FetchClientController,
    FetchOrganizationController,
    FetchOrganizationByIdController,
    FetchProfessionalController,
    ForgotPasswordController,
    RemoveProfessionalFromOrganizationController,
    RescheduleAppointmentController,
    UpdateOrganizationController,
  ],
  providers: [
    AddProfessionalToOrganizationUseCase,
    AuthenticateStudentUseCase,
    CancelAppointmentUseCase,
    ConfirmAppointmentUseCase,
    CreateAddressUseCase,
    CreateAppointmentUseCase,
    CreateCancellationPolicyUseCase,
    CreateClientUseCase,
    CreateOrganizationUseCase,
    CreateProfessionalUseCase,
    CreateScheduleConfigurationUseCase,
    FetchClientsUseCase,
    FetchOrganizationByIdUseCase,
    ForgotPasswordUseCase,
    RegisterUserUseCase,
    RemoveProfessionalFromOrganizationUseCase,
    RescheduleAppointmentUseCase,
    UpdateOrganizationUseCase,
  ],
})
export class HttpModule {}
