import { Env } from '@/infra/env/env'
import { ConversationFlow } from '@/infra/flow/types'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

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

  async extractRegistrationData(message: string) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}T00:00:00`

    const response = await this.chat([
      {
        role: 'system',
        content: `Você é um assistente que extrai dados estruturados de mensagens de usuários para diferentes fluxos (ex: cadastro, agendamento, etc).
Receba a mensagem do usuário e retorne um JSON com dois campos:

data: um objeto com os campos extraídos (ex: name, email, cpf, birthDate, gender, cep, number, complement, periodPreference, extraPreferences, etc).
missingFields: um array de strings com os nomes dos campos obrigatórios que não foram encontrados ou estão incompletos.
Se não conseguir extrair nenhum dado, retorne null no campo data e liste todos os campos obrigatórios em missingFields.


periodPreference pode ser um array com os valores "MORNING", "AFTERNOON" e/ou "EVENING".
birthDate deve estar como ISO 8601 (YYYY-MM-DDT00:00:00), entao interprete a data de nascimento fornecida pelo usuário nesse formato. Lembrando que hoje é ${formattedDate}, então interprete a data de nascimento considerando que não pode ser uma data futura.

Aqui está o formato esperado do JSON de resposta:

{
  "data": {
    "name": "Nome Completo",
    "email": "email@email.com",
    "cpf": "000.000.000-00",
    "birthDate": "YYYY-MM-DDT00:00:00",
    "gender": "MALE ou FEMALE",
    "cep": "00000-000",
    "number": "Número residencial",
    "complement": "Complemento (opcional)",
    "periodPreference": ["MORNING", "AFTERNOON", "EVENING"],
    "extraPreferences": "Preferências extras (opcional)"
  },
  "missingFields": ["nome", "email", "cpf", ...]
}

Se algum campo estiver incompleto ou ilegível, considere-o como faltando.

Aqui estão os campos obrigatórios para o fluxo de cadastro:
- Nome completo
- Email
- CPF
- Data de nascimento
- Gênero
- CEP
- Número residencial
Os campos 'complement', 'periodPreference' e 'extraPreferences' são opcionais.

Extraia os dados da seguinte mensagem do usuário, que muito provavelmente vao inserir os dados após os dois pontos no formato solicitado:
      
Nome completo:           
Email:
CPF:
Data de nascimento:
Gênero:
CEP:
Número residencial:
Complemento (opcional):
Período de preferência para atendimentos (Manhã, Tarde e/ou Noite): 
Preferências extras (opcional):

Então retorne apenas o JSON com os campos preenchidos.
      `,
      },
      { role: 'user', content: message },
    ])

    try {
      let content = response.choices[0].message.content
      const match = content!.match(/\{[\s\S]*\}/)
      if (match) content = match[0]
      const result = content ? JSON.parse(content) : null

      return result
    } catch {
      return null
    }
  }

  async determineUserIntent(message: string): Promise<ConversationFlow> {
    const validFlows: ConversationFlow[] = [
      ConversationFlow.REGISTRATION,
      ConversationFlow.SCHEDULE_APPOINTMENT,
      ConversationFlow.RESCHEDULE,
      ConversationFlow.APPOINTMENT_CANCEL,
      ConversationFlow.LIST_PROFESSIONAL,
      ConversationFlow.LIST_CLIENT_APPOINTMENT,
    ]

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
Você é um roteador de intenções. Analise a mensagem do usuário e classifique-a em uma das seguintes categorias:
registration, schedule_appointment, reschedule, appointment_cancel, list_professional, list_client_appointments.

- Se o usuário quer se cadastrar, responda 'registration'.
- Se o usuário quer marcar ou agendar, responda 'schedule_appointment'.
- Se o usuário quer remarcar, responda 'reschedule'.
- Se o usuário quer cancelar um agendamento, responda 'appointment_cancel'.
- Se o usuário quer ver profissionais, responda 'list_professional'.
- Se o usuário quer ver seus agendamentos, responda 'list_client_appointments'.
- Se for algo geral, saudação ou dúvida, responda 'general_chat'.

Responda APENAS com a categoria, sem explicações.
          `,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0,
        max_tokens: 30,
      })

      const intent = response.choices[0].message.content?.trim().toLowerCase()

      if (intent && validFlows.includes(intent as ConversationFlow)) {
        return intent as ConversationFlow
      }

      // fallback seguro
      return ConversationFlow.LIST_PROFESSIONAL // ou qualquer fluxo padrão que faça sentido
    } catch (error) {
      console.error('Erro ao determinar intenção:', error)
      return ConversationFlow.LIST_PROFESSIONAL
    }
  }
}
