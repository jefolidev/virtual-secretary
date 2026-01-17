import { Env } from '@/infra/env/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

@Injectable()
export class OpenAiService extends OpenAI {
  constructor(private readonly configService: ConfigService<Env, true>) {
    const apiKey = configService.get('OPENAI_API_KEY')

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables')
    }

    super({
      apiKey,
      logLevel: 'debug',
    })
  }
}
