import { WhatsappRepository } from '@/domain/scheduling/application/repositories/whatsapp.repository'
import { Env } from '@/infra/env/env'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { PrismaService } from '../prisma.service'
@Injectable()
export class PrismaWhatsappRepository implements WhatsappRepository {
  public readonly apiKey: string
  public readonly assistantId: string
  public readonly openaiApiKey: string
  public readonly apiUrl: string

  constructor(
    @InjectRedis() private readonly redis: Redis,

    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Env, true>,
    // private readonly openAiService: OpenAiService,
    // private readonly userRepository: UserRepository,
    // private readonly appointmentRepository: AppointmentsRepository,

    // private readonly sessionService: SessionService,

    // @Inject(CACHE_MANAGER)
    // private readonly cacheManager: Cache,
    // @InjectQueue('whatsapp-reminders')
    // private readonly remindersQueue: Queue,
  ) {
    this.apiKey = this.configService.get<string>('AUTHENTICATION_API_KEY')
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY')
    this.assistantId = this.configService.get('ASSISTANT_ID')
    this.apiUrl = this.configService.get<string>('EVOLUTION_API_URL')
  }

  async markPendingEvaluation(
    whatsappNumber: string,
    appointmentId: string,
  ): Promise<void> {
    const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60

    const key = `pending-evaluation:${whatsappNumber}`
    const ttlSeconds = SEVEN_DAYS_IN_SECONDS

    await this.redis.set(key, appointmentId, 'EX', ttlSeconds)
  }

  async getPendingEvaluation(whatsappNumber: string): Promise<string | null> {
    return this.redis.get(`pending-evaluation:${whatsappNumber}`)
  }

  async clearPendingEvaluation(whatsappNumber: string): Promise<void> {
    await this.redis.del(`pending-evaluation:${whatsappNumber}`)
  }

  async sendMessage(to: string, text: string): Promise<string> {
    const url = `${this.apiUrl}/message/sendText/${this.configService.get('EVOLUTION_INSTANCE_ID')}`

    try {
      const payload = { number: to, text: text }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(
          `Failed to send message: ${response.statusText} - ${errorData}`,
        )
      }

      const data = await response.json()
      return 'teste'
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      throw error
    }
  }
}
