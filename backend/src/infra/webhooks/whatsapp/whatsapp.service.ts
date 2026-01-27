import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { Env } from '@/infra/env/env'
import { EnvEvolution } from '@/infra/env/evolution/env-evolution'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cache } from 'cache-manager'
import { OpenAiService } from '../openai/openai.service'
import {
  ConversationContext,
  ConversationStatus,
} from '../openai/types/conversations-flow'
import { openAiFunctions } from '../openai/types/openai-functions'
import { CreateClientBodyDTO } from './dto/create-client.dto'

@Injectable()
export class WhatsappService {
  public readonly apiKey: string
  public readonly assistantId: string
  public readonly openaiApiKey: string

  constructor(
    private readonly configEvolutionService: ConfigService<EnvEvolution, true>,
    private readonly configService: ConfigService<Env, true>,

    private readonly openAiService: OpenAiService,
    private readonly userRepository: UserRepository,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get<string>('AUTHENTICATION_API_KEY')
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY')
    this.assistantId = this.configService.get('ASSISTANT_ID')
  }

  private async getConversation(conversationId: string) {
    const conversation = await this.cacheManager.get<ConversationContext>(
      `whatsapp-conversation-${conversationId}`,
    )

    return conversation || null
  }

  private async updateConversationStatus(
    conversationId: string,
    status: ConversationStatus,
  ) {
    const conversation = await this.getConversation(conversationId)

    if (!conversation) {
      throw new BadRequestException('Conversation not found')
    }

    const updatedConversation = {
      ...conversation,
      status,
      lastMessageAt: new Date(),
    }

    await this.saveConversationContext(conversationId, updatedConversation)

    return updatedConversation
  }

  private async getConversationContext(
    phone: string,
  ): Promise<ConversationContext | null> {
    return (
      (await this.cacheManager.get<ConversationContext>(
        `whatsapp-conversation-${phone}`,
      )) || null
    )
  }

  private async saveConversationContext(
    phone: string,
    context: ConversationContext,
  ) {
    await this.cacheManager.set(
      `whatsapp-conversation-${phone}`,
      context,
      1000 * 60 * 15,
    ) // 15 minutes
  }

  private async deleteConversationContext(phone: string) {
    await this.cacheManager.del(`whatsapp-conversation-${phone}`)
  }

  private async createClient(
    rawArgs: Omit<CreateClientBodyDTO, 'whatsappNumber'>,
    whatsappNumber: string,
  ) {
    const [day, month, year] = rawArgs.birthDate.toString().split('/')
    const isoBirthDate = new Date(`${year}-${month}-${day}`)

    if (isNaN(isoBirthDate.getTime())) {
      throw new BadRequestException('Formato de data de nascimento inválido.')
    }

    const clientData: CreateClientBodyDTO = {
      ...rawArgs,
      birthDate: isoBirthDate,
      whatsappNumber: whatsappNumber,
    }

    const requiredFields: Array<keyof CreateClientBodyDTO> = [
      'name',
      'email',
      'cpf',
      'birthDate',
      'gender',
      'whatsappNumber',
      'cep',
      'number',
      'periodPreference',
    ]

    const missingFields = requiredFields.filter((field) => !clientData[field])

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Campos obrigatórios faltando no processamento final: ${missingFields.join(
          ', ',
        )}`,
      )
    }

    await this.userRepository.createClientByWhatsapp(clientData)
  }

  private async listProfessionals() {
    return await this.userRepository.findManyProfessionalUsers()
  }

  private async handleGeneralChat(message: string, user: User) {
    const response = await this.openAiService.chat([
      {
        role: 'system',
        content: `Você é a MindAI, uma assistente virtual de uma clínica de terapia. Você está conversando com ${user.name}, que já é um cliente cadastrado.

**SUAS DIRETRIZES E LIMITAÇÕES SÃO ESTRITAS:**

1.  **FOCO TOTAL:** Seu único propósito é discutir assuntos diretamente relacionados aos serviços da clínica:
    *   Agendamentos de consultas.
    *   Informações sobre os profissionais da clínica.
    *   Dúvidas sobre os tipos de terapia oferecidos (TCC, Psicanálise, etc.).
    *   Informações sobre saúde mental em um contexto clínico e informativo.

2.  **RECUSA EDUCADA:** Se o usuário perguntar sobre tópicos fora do seu escopo (como pornografia, política, religião, sua vida pessoal como IA, ou qualquer assunto casual não relacionado à terapia), você DEVE recusar educadamente e redirecionar a conversa.
    *   **Exemplo de recusa:** "Como assistente da MindAI, meu foco é auxiliar com nossos serviços de terapia e saúde mental. Não consigo discutir outros tópicos, mas estou à disposição para ajudar com agendamentos ou responder a perguntas sobre nossas especialidades. Como posso te ajudar com isso?"

3.  **NÃO DÊ OPINIÕES:** Você não tem opiniões pessoais. Mantenha todas as respostas neutras, profissionais e baseadas em informações clínicas.

Sua tarefa é responder à pergunta do usuário, seguindo RIGOROSAMENTE estas diretrizes.`,
      },
      {
        role: 'user',
        content: message,
      },
    ])
    return (
      response.choices[0].message.content ||
      'Não consegui processar sua resposta, mas estou aqui se precisar.'
    )
  }

  private async handleListProfessionalsFlow(
    message: string,
    cleanNumber: string,
    sender: string,
    context: ConversationContext,
  ) {
    context.lastInteraction = new Date()
    await this.saveConversationContext(cleanNumber, context)

    const professionals = (await this.listProfessionals()) || [] // Garante que temos um array
    const professionalsListText =
      professionals.length > 0
        ? professionals
            .map((prof) => `- ${prof.name} - Disponível para consultas.`)
            .join('\n')
        : 'No momento, não encontramos profissionais disponíveis. Por favor, tente novamente mais tarde.'

    const response = this.openAiService.chat([
      {
        role: 'system',
        content: `Você é a MindAI, uma assistente virtual de uma clínica de terapia. Você está conversando com ${sender}, que já é um cliente cadastrado.

Seu objetivo é fornecer uma lista de profissionais disponíveis na clínica quando solicitado.

Aqui estão os profissionais disponíveis:
${professionalsListText}

Quando o usuário solicitar a lista de profissionais, forneça as informações acima de forma clara e amigável.`,
      },
      {
        role: 'user',
        content: message,
      },
    ])

    return (
      (await response).choices[0].message.content ||
      'Não consegui processar sua resposta, mas estou aqui se precisar.'
    )
  }

  private async handleRegisteredUserFlow(message: string, user: User) {
    if (await this.openAiService.isCancellationIntent(message)) {
      return 'Tudo bem, cancelando a operação atual. Se precisar de outra coisa, é só pedir!'
    }

    const intent = await this.openAiService.determineUserIntent(message)

    let context = await this.getConversationContext(user.whatsappNumber)

    switch (intent) {
      case 'schedule_appointment':
        return `Ok, ${user.name}, vamos agendar uma consulta para você. (Lógica a ser implementada)`
      case 'list_client_appointments':
        return `Claro, ${user.name}, vou buscar seus agendamentos. (Lógica a ser implementada)`
      case 'list_professionals':
        if (!context || context.flow !== 'list_professionals') {
          context = {
            flow: 'list_professionals',
            status: 'listing_professionals',
            lastInteraction: new Date(),
            data: {},
          }
        }
        return this.handleListProfessionalsFlow(
          message,
          user.whatsappNumber,
          user.name,
          context,
        )
      case 'general_chat':
      default:
        return this.handleGeneralChat(message, user)
    }
  }

  private async handleUnregisteredUserFlow(
    message: string,
    cleanNumber: string,
    sender: string,
  ) {
    if (await this.openAiService.isCancellationIntent(message)) {
      await this.deleteConversationContext(cleanNumber)
      return 'Tudo bem! Se precisar de algo mais no futuro, é só chamar. Tenha um ótimo dia!'
    }

    let context = await this.getConversationContext(cleanNumber)

    if (context && context.lastInteraction) {
      const timeSinceLastInteraction =
        new Date().getTime() - new Date(context.lastInteraction).getTime()
      const thirtyMinutes = 1000 * 60 * 30

      if (
        timeSinceLastInteraction > thirtyMinutes &&
        context.status === 'awaiting_registration_confirmation'
      ) {
        const isGreeting = await this.openAiService.isGreeting(message)
        if (isGreeting) {
          await this.deleteConversationContext(cleanNumber)
          context = null
        }
      }
    }

    if (!context) {
      context = {
        flow: 'create_client_account',
        status: 'awaiting_registration_confirmation',
        lastInteraction: new Date(),
        data: {},
      }
      await this.saveConversationContext(cleanNumber, context)
    }

    if (context.flow !== 'create_client_account') {
      context.flow = 'create_client_account'
      context.status = 'awaiting_registration_confirmation'
    }

    return this.handleCreateClientAccountFlow(
      message,
      cleanNumber,
      sender,
      context,
    )
  }

  private async handleScheduleAppointmentFlow(
    message: string,
    cleanNumber: string,
    sender: string,
    context: ConversationContext,
  ) {
    return 'Ok, vamos agendar sua consulta! (Lógica a ser implementada)'
  }

  private async handleCreateClientAccountFlow(
    message: string,
    cleanNumber: string,
    sender: string,
    context: ConversationContext,
  ) {
    context.lastInteraction = new Date()
    await this.saveConversationContext(cleanNumber, context)

    const response = await this.openAiService.chat(
      [
        {
          role: 'system',
          content: `Você é uma assistente virtual de uma clínica de terapia chamada MindAI.

O usuário ${sender} NÃO está cadastrado no sistema.

IMPORTANTE - FLUXO DE CADASTRO:

1. PRIMEIRA INTERAÇÃO (status: awaiting_registration_confirmation):
   - Cumprimente o usuário, informe que ele não está cadastrado e pergunte se deseja fazer o cadastro.

2. SE O USUÁRIO ACEITAR:
   - Mude o status da conversa para 'collecting_registration_data'.
   - Peça TODOS os dados de uma vez: Nome completo, Email, CPF, Data de nascimento, Gênero, CEP, Número residencial, Complemento (opcional) e Período de preferência.

3. VALIDAÇÃO (status: collecting_registration_data):
   - Após o usuário enviar os dados, valide-os.
   - Se um dado estiver faltando ou for claramente inválido (ex: um texto no lugar de uma data), peça a correção de forma específica e educada.
   - **IMPORTANTE: Não se preocupe com a formatação de CPF e CEP (pontos, traços). Apenas verifique se os números foram fornecidos. A formatação final é responsabilidade do sistema.**
   - **TRADUÇÃO DE GÊNERO: Ao chamar a função, traduza o gênero para o inglês: "Masculino" para "MALE", "Feminino" para "FEMALE" e "Outro" para "OTHER". Não pergunte isso ao usuário.**

4. QUANDO TIVER TODOS OS DADOS VÁLIDOS:
   - Chame a função 'create_client_account' com todos os dados coletados.

5. SE O USUÁRIO RECUSAR O CADASTRO:
   - Agradeça, ofereça ajuda futura e finalize a conversa.

CONTEXTO ATUAL:
Status da conversa: ${context.status}
Dados já coletados: ${JSON.stringify(context.data || {})}

Seja natural, conversacional e amigável. Não use muitos emojis.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      openAiFunctions,
    )

    if (context.status === 'awaiting_registration_confirmation') {
      context.status = 'collecting_registration_data'
      await this.saveConversationContext(cleanNumber, context)
    }

    if (
      response.choices[0].message.tool_calls &&
      response.choices[0].message.tool_calls.length > 0
    ) {
      const toolCall = response.choices[0].message.tool_calls[0]

      if (
        toolCall.type === 'function' &&
        toolCall.function.name === 'create_client_account'
      ) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        if (functionName === 'create_client_account') {
          try {
            // A lógica complexa foi removida daqui...
            await this.createClient(functionArgs, cleanNumber)

            await this.deleteConversationContext(cleanNumber)

            return `✅ Conta criada com sucesso!\n\nBem-vindo(a), ${functionArgs.name}! Agora você pode agendar suas consultas pelo WhatsApp.`
          } catch (error) {
            console.error('Erro ao criar usuário:', error)
            return `❌ Desculpe, ocorreu um erro ao criar sua conta. Por favor, tente novamente mais tarde.`
          }
        }
      }
    }
    return (
      response.choices[0].message.content ||
      'Desculpe, não consegui entender sua mensagem.'
    )
  }

  async handleIncompleteConversation(conversationId: string) {
    const conversation = await this.getConversation(conversationId)

    if (!conversation) {
      throw new BadRequestException('Conversation not found')
    }

    if (conversation.status === 'awaiting_registration_confirmation') {
      const lastMessage = conversation.lastInteraction
      const timeSinceLastMessage = Date.now() - lastMessage!.getTime()

      //5 minutos
      if (timeSinceLastMessage > 1000 * 60 * 5) {
        return 'Oi! Notei que você não respondeu à minha última mensagem. Se ainda estiver interessado em criar uma conta, por favor, me avise! Estou aqui para ajudar no que for preciso.'
      }
    }

    if (conversation.status === 'collecting_registration_data') {
      return 'Olá! Percebi que não concluímos o processo de criação da sua conta. Se ainda desejar criar uma conta, por favor, me informe os dados necessários ou me avise se precisar de ajuda.'
    }

    return null
  }

  async sendMessage(to: string, text: string) {
    const url = `http://localhost:8080/message/sendText/MindAI`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: to,
          text: text,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(
          `Failed to send message: ${response.statusText} - ${errorData}`,
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      throw error
    }
  }

  async processMessage(message: string, whatsappId: string, sender: string) {
    const cleanNumber = whatsappId.split('@')[0]

    const user = await this.userRepository.findByPhone(cleanNumber)

    if (user) {
      return this.handleRegisteredUserFlow(message, user)
    }

    return this.handleUnregisteredUserFlow(message, cleanNumber, sender)
  }
}
