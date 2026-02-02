import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
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
  imports: [DatabaseModule, OpenAIModule],
  providers: [
    FlowService,
    AppointmentFlowService,
    RegistrationFlowService,
    GeneralFlowService,
  ],
})
export class FlowModule {}
