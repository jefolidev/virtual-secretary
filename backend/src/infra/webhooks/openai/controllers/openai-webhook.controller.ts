import { Body, Controller, Headers, Post } from '@nestjs/common'
import { OpenAiService } from '../integrations/openai/openai.service'

@Controller('webhooks/openai')
export class OpenAIWebhookController {
  constructor(private openAiService: OpenAiService) {}

  @Post()
  async handleWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ) {
    // Lógica do webhook OpenAI
    return { status: 'received' }
  }
}
