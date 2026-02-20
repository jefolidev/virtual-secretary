import { DatabaseModule } from '@/infra/database/database.module'
import { FlowModule } from '@/infra/flow/flow.module'
import { FlowService } from '@/infra/flow/flow.service'
import { SessionModule } from '@/infra/sessions/session.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { OpenAiService } from '../openai/openai.service'
import { HandleEvolutionController } from './controllers/handle-evolution.controller'
import { WhatsappRemindersProcessor } from './queues/reminder-processor'
import { WhatsappService } from './whatsapp.service'

@Module({
  providers: [
    WhatsappService,
    OpenAiService,
    FlowService,
    WhatsappRemindersProcessor,
  ],
  exports: [WhatsappService],
  controllers: [HandleEvolutionController],
  imports: [
    BullModule.registerQueue({ name: 'whatsapp-reminders' }),
    DatabaseModule,
    SessionModule,
    FlowModule,
  ],
})
export class WhatsappModule {}
