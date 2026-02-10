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

  async extractScheduleData(message: string) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}T00:00:00`

    const response = await this.chat([
      {
        role: 'system',
        content: `"Você é o MindAI, um assistente de agendamento altamente educado. Sua tarefa é processar a mensagem do usuário e retornar um JSON estruturado.

### REGRAS TÉCNICAS (Campos do JSON):
1. Hoje é ${formattedDate}. Considere isso ao interpretar datas.
2. 'startDateTime': Deve ser ISO 8601 (YYYY-MM-DDTHH:mm:ss). Se o usuário não informar o horário exato, retorne null e adicione 'horário' em 'missingFields'.
3. 'professionalName': Nome do profissional extraído.
4. 'modality': Se for presencial, mapeie estritamente para 'IN_PERSON'. Se for online, mapeie para 'ONLINE'.

### REGRAS DE COMUNICAÇÃO (Campo 'confirmationMessage'):
- NUNCA exiba termos como 'IN_PERSON' ou 'ONLINE' para o usuário.
- Traduza 'IN_PERSON' para 'Presencial' e 'ONLINE' para 'Online'.
- Formate a data para o padrão brasileiro: 'DD/MM/AAAA às HH:mm'.
- Se houver campos faltando, a 'confirmationMessage' deve pedir os dados educadamente.

### FORMATO DE RESPOSTA (JSON APENAS):
{
  \"data\": {
    \"startDateTime\": \"2026-03-15T14:00:00\",
    \"professionalName\": \"Dr. Silva\",
    \"modality\": \"IN_PERSON\"
  },
  \"missingFields\": [],
  \"confirmationMessage\": \"Confirme os detalhes do agendamento:\n\nProfissional: Dr. Silva\nData e Hora: 15/03/2026 às 14:00\nModalidade: Presencial\n\nPor favor, responda com 'sim' para confirmar ou 'não' para cancelar.\"
}

Mensagem do usuário:

${message}
      `,
      },
      { role: 'user', content: message },
    ])

    try {
      let content = response.choices[0].message.content
      console.log(content)
      const match = content!.match(/\{[\s\S]*\}/)
      if (match) content = match[0]
      const result = content ? JSON.parse(content) : null

      return result
    } catch {
      return null
    }
  }

  async extractDateOnly(message: string) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}T00:00:00`

    const response = await this.chat([
      {
        role: 'system',
        content: `Você é um extrator que recebe uma mensagem do usuário e retorna apenas um JSON com o campo startDateTime no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss) ou null se não houver data/horário presente. Considere que hoje é ${formattedDate} ao interpretar expressões relativas como "amanhã" ou "depois". Retorne apenas o JSON. Exemplo: { "startDateTime": "2026-03-15T14:00:00" } ou { "startDateTime": null }`,
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

  async extractProfessionalOnly(message: string) {
    const response = await this.chat([
      {
        role: 'system',
        content: `Você é um extrator que recebe uma mensagem do usuário e retorna um JSON com o campo professionalName contendo o nome do profissional extraído, ou null se não houver referência a profissional. Retorne apenas o JSON, por exemplo: { "professionalName": "Dr. Silva" }`,
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

  async extractModalityOnly(message: string) {
    const response = await this.chat([
      {
        role: 'system',
        content: `Você é um extrator que recebe uma mensagem do usuário e retorna um JSON com o campo modality contendo 'IN_PERSON' para presencial, 'ONLINE' para online, ou null se não for possível determinar. Retorne apenas o JSON, por exemplo: { "modality": "IN_PERSON" }`,
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
- Se você identificar que o usuário está tentando marcar um horário, mesmo que não seja explícito, responda 'schedule_appointment'. Por exemplo, se o usuário disser "Quero uma consulta com o Dr. Silva", isso indica uma intenção de agendamento. Se ele mencionar um profissional, data ou horário, mesmo que de forma vaga, isso também indica intenção de agendamento. Se o atual contexto da conversa sugere que o próximo passo natural seria um agendamento, isso também é um forte indicativo. Se o atual contexto da conversa sugere que o usuário está buscando informações sobre um profissional específico, isso também pode indicar uma intenção de agendamento, pois muitas vezes os usuários procuram por um profissional com a intenção de marcar uma consulta.
- Se o usuário quer marcar ou agendar, responda 'schedule_appointment'.
- Se o usuário quer remarcar, responda 'reschedule'.
- Se o usuário quer cancelar um agendamento, responda 'appointment_cancel'.
- Se o usuário quer ver profissionais, responda 'list_professional'.
- Se o usuário pedir algo como "ver meus agendamentos" ou "ver seus agendamentos", ou qualquer outra frase semelhante, responda 'list_client_appointment'. 
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
