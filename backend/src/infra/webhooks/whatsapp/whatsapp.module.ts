import { Module } from '@nestjs/common'
import { HandleEvolutionController } from './controllers/handle-evolution.controller'
import { WhatsappService } from './whatsapp.service'

@Module({
  providers: [WhatsappService],
  exports: [WhatsappService],
  controllers: [HandleEvolutionController],
})
export class WhatsappModule {}
