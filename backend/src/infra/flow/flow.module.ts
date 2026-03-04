import { InitiateNewTransactionUseCase } from '@/domain/payments/application/use-case/initiate-new-transaction'
import { CreateAppointmentUseCase } from '@/domain/scheduling/application/use-cases/create-schedule'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { MercadoPagoModule } from '../webhooks/mercado-pago/mercado-pago.module'
import { OpenAIModule } from '../webhooks/openai/openai.module'
import { FlowService } from './flow.service'
import { AppointmentFlowService } from './flows/appointment-flow.service'
import { GeneralFlowService } from './flows/general-flow.service'
import { RegistrationFlowService } from './flows/registration-flow.service'

@Module({
  exports: [
    FlowModule,
    AppointmentFlowService,
    RegistrationFlowService,
    GeneralFlowService,
  ],
  imports: [DatabaseModule, OpenAIModule, MercadoPagoModule],
  providers: [
    FlowService,
    AppointmentFlowService,
    RegistrationFlowService,
    GeneralFlowService,

    CreateAppointmentUseCase,
    InitiateNewTransactionUseCase,
  ],
})
export class FlowModule {}
