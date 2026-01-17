import { Module } from '@nestjs/common'
import { OpenAIController } from './controllers/openai-webhook.controller'
import { OpenAiService } from './openai.service'

@Module({
  providers: [OpenAiService],
  exports: [OpenAiService],
  controllers: [OpenAIController],
})
export class OpenAIModule {}
