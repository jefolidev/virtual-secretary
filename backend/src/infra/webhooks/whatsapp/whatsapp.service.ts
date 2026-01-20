import { Env } from '@/infra/env/env'
import { EnvEvolution } from '@/infra/env/evolution/env-evolution'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class WhatsappService {
  public readonly apiKey: string
  public readonly assistantId: string
  public readonly openaiApiKey: string

  constructor(
    private readonly configEvolutionService: ConfigService<EnvEvolution, true>,
    private readonly configService: ConfigService<Env, true>,
  ) {
    this.apiKey = this.configEvolutionService.get<string>(
      'AUTHENTICATION_API_KEY',
    )
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY')
    this.assistantId = this.configService.get('ASSISTANT_ID')
  }

  

}
