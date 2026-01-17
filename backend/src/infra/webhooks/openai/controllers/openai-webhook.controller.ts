import { Public } from '@/infra/auth/public'
import { Body, Controller, Headers, Post } from '@nestjs/common'
import { OpenAiService } from '../openai.service'

@Controller('webhooks/openai')
export class OpenAIController {
  constructor(private openAiService: OpenAiService) {}

  @Post()
  @Public()
  async handleWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ) {
    return { status: 'received' }
  }
}
