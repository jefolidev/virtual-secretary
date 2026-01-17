import { Module } from '@nestjs/common'
import { OpenAiService } from './openai.service';

@Module({
  providers: [OpenAiService],
})
export class OpenAIModule {}
c