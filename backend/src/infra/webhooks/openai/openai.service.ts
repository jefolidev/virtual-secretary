import { Env } from '@/infra/env/env'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { ConversationFlow } from './types/conversations-flow'

@Injectable()
export class OpenAiService {
  private readonly client: OpenAI

  constructor(private readonly configService: ConfigService<Env, true>) {
    const apiKey = configService.get('OPENAI_API_KEY')

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables')
    }

    this.client = new OpenAI({
      apiKey,
      logLevel: 'debug',
    })
  }

  async chat(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[],
  ) {
    return this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
    })
  }

  async isGreeting(message: string): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um classificador de texto. Sua única função é determinar se a mensagem do usuário é uma saudação simples (como "oi", "bom dia", "olá", "e aí?") sem nenhum outro pedido ou pergunta. Responda apenas com "true" se for uma saudação simples, e "false" caso contrário.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0,
        max_tokens: 10,
      })

      const result = response.choices[0].message.content?.trim().toLowerCase()
      return result === 'true'
    } catch (error) {
      console.error('Erro ao classificar saudação:', error)
      return false // Em caso de erro, assume que não é uma saudação para não resetar a conversa por engano.
    }
  }

  async isCancellationIntent(message: string): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um classificador de texto. Sua única função é determinar se a mensagem do usuário expressa uma intenção de cancelar, parar, sair ou abandonar o processo atual (como um cadastro ou agendamento). Exemplos: "não quero mais", "cancelar", "deixa pra lá", "tchau, não vou fazer agora". Responda apenas com "true" se for uma intenção de cancelamento, e "false" caso contrário.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0,
        max_tokens: 10,
      })

      const result = response.choices[0].message.content?.trim().toLowerCase()
      return result === 'true'
    } catch (error) {
      console.error('Erro ao classificar intenção de cancelamento:', error)
      return false // Em caso de erro, não cancela para evitar interrupções indesejadas.
    }
  }

  async determineUserIntent(message: string): Promise<ConversationFlow> {
    // Lista dos principais fluxos que representam um objetivo inicial do usuário.
    const highLevelFlows: ConversationFlow[] = [
      'create_client_account',
      'schedule_appointment',
      'list_professionals',
      'list_client_appointments',
      'create_feedback',
      'general_chat',
    ]

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um roteador de intenções. Analise a mensagem do usuário e classifique-a em uma das seguintes categorias: ${highLevelFlows.join(
              ', ',
            )}. 
            - Se o usuário quer se cadastrar, use 'create_client_account'.
            - Se o usuário quer marcar, agendar ou ver horários, use 'schedule_appointment'.
            - Se o usuário quer ver seus agendamentos, use 'list_client_appointments'.
            - Se for uma saudação, dúvida geral ou algo não relacionado, use 'general_chat'.
            Responda APENAS com a categoria.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0,
        max_tokens: 30,
      })

      const intent =
        response.choices[0].message.content?.trim() as ConversationFlow

      if (highLevelFlows.includes(intent)) {
        return intent
      }

      // Fallback seguro
      return 'general_chat'
    } catch (error) {
      console.error('Erro ao determinar intenção:', error)
      return 'general_chat'
    }
  }
}
