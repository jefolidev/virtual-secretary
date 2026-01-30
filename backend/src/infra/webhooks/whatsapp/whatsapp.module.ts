import { DatabaseModule } from '@/infra/database/database.module'
import { FlowModule } from '@/infra/flow/flow.module'
import { FlowService } from '@/infra/flow/flow.service'
import { SessionModule } from '@/infra/sessions/session.module'
import { Module } from '@nestjs/common'
import { OpenAiService } from '../openai/openai.service'
import { HandleEvolutionController } from './controllers/handle-evolution.controller'
import { WhatsappService } from './whatsapp.service'

@Module({
  providers: [WhatsappService, OpenAiService, FlowService],
  exports: [WhatsappService],
  controllers: [HandleEvolutionController],
  imports: [DatabaseModule, SessionModule, FlowModule],
})
export class WhatsappModule {}
