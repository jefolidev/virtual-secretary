import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { OpenAiService } from '../openai/openai.service'
import { HandleEvolutionController } from './controllers/handle-evolution.controller'
import { WhatsappService } from './whatsapp.service'

@Module({
  providers: [WhatsappService, OpenAiService],
  exports: [WhatsappService],
  controllers: [HandleEvolutionController],
  imports: [DatabaseModule],
})
export class WhatsappModule {}
