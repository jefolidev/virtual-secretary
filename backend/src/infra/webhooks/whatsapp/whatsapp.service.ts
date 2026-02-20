import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { AppointmentModalityType } from '@/domain/scheduling/enterprise/entities/appointment'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { Env } from '@/infra/env/env'
import { EnvEvolution } from '@/infra/env/evolution/env-evolution'
import { ConversationFlow } from '@/infra/flow/types'
import { SessionService } from '@/infra/sessions/session.service'
import { InjectQueue } from '@nestjs/bullmq'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { Cache } from 'cache-manager'
import dayjs from 'dayjs'
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
  public readonly apiUrl: string

  constructor(
    private readonly configEvolutionService: ConfigService<EnvEvolution, true>,
    private readonly configService: ConfigService<Env, true>,

    private readonly openAiService: OpenAiService,
    private readonly userRepository: UserRepository,
    private readonly appointmentRepository: AppointmentsRepository,

    private readonly sessionService: SessionService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @InjectQueue('whatsapp-reminders')
    private readonly remindersQueue: Queue,
  ) {
    this.apiKey = this.configService.get<string>('AUTHENTICATION_API_KEY')
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY')
    this.assistantId = this.configService.get('ASSISTANT_ID')
    this.apiUrl = this.configService.get<string>('EVOLUTION_API_URL')
  }

  //  async createSession(clientId: string) {
  //    return this.sessionService.getOrCreateSession(clientId)
  //  }

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
    )
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

  private async scheduleAppointment(data: {
    whatsappNumber: string
    professionalName: string
    startDateTime: Date
    modality: string
  }) {
    return await this.appointmentRepository.scheduleFromRawData({
      modality: data.modality,
      startDateTime: data.startDateTime,
      professionalName: data.professionalName,
      whatsappNumber: data.whatsappNumber,
    })
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

    const professionals = (await this.listProfessionals()) || []
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

Seu objetivo é fornecer uma lista de profissionais disponíveis na plataforma quando solicitado. Junto deles virá o endereço deles, veja se o profissional possui alguma organização associada, se sim, adicione o endereço da organização, se não, exiba o endereço associado ao profissional. Discrimine se é uma cliníca (se possuir uma organização associada) ou se é um consultório (se não possuir organização associada).

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

    let context = await this.getConversationContext(user.whatsappNumber)

    if (context && context.flow) {
      const flowHandlers: Record<string, Function> = {
        schedule_appointment: this.handleScheduleAppointmentFlow,
        collecting_registration_data: this.handleCreateClientAccountFlow,
        list_professionals: this.handleListProfessionalsFlow,
      }

      const handler = flowHandlers[context.flow]

      if (handler) {
        return handler.bind(this)(
          message,
          user.whatsappNumber,
          user.name,
          context,
        )
      }
    }

    const intent = await this.openAiService.determineUserIntent(message)

    switch (intent) {
      case 'schedule_appointment':
        if (!context || context.flow !== 'schedule_appointment') {
          context = {
            flow: 'schedule_appointment',
            status: 'awaiting_schedule_data',
            lastInteraction: new Date(),
            data: {},
          }
          await this.saveConversationContext(user.whatsappNumber, context)

          return (
            `Olá ${user.name}! Para agendar sua consulta, por favor informe:\n\n` +
            `1. *Profissional* (Ex: Dr. Pedro)\n` +
            `2. *Data e Hora* (Ex: Amanhã às 10h)\n` +
            `3. *Modalidade* (Presencial ou Remoto)\n\n` +
            `Você pode enviar tudo em uma única mensagem, como: *"Dr Pedro, amanhã às 10 horas, atendimento remoto"*.\n\n` +
            `_Dica: Se quiser ver quem atende aqui, peça para "olhar os profissionais"._`
          )
        }
        return this.handleScheduleAppointmentFlow(
          message,
          user.whatsappNumber,
          user.name,
          context,
        )
      case 'list_client_appointments':
        return `Claro, ${user.name}, vou buscar seus agendamentos. (Lógica a ser implementada)`
      case ConversationFlow.LIST_PROFESSIONAL:
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

      case ConversationFlow.GENERAL_CHAT:
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

      const registrationContext =
        context.status === 'awaiting_registration_confirmation' ||
        context.status === 'collecting_registration_data'

      if (timeSinceLastInteraction > thirtyMinutes || registrationContext) {
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
  ): Promise<string> {
    context.lastInteraction = new Date()
    if (!context.data) context.data = {}

    const lowerMsg = message.toLowerCase().trim()
    const isComplete = !!(
      context.data.professional &&
      context.data.datetime &&
      context.data.modality
    )

    // 1. INTERCEPTAÇÃO MANUAL DE CONFIRMAÇÃO (Resolve o loop do "SIM")
    const confirmationWords = [
      'sim',
      'ok',
      'pode',
      'confirmar',
      'confirma',
      'fechou',
      'com certeza',
      'pode sim',
      'pode finalizar',
      'esta certo',
    ]

    const normalizeModality = (mod: string): AppointmentModalityType => {
      const m = mod.toLowerCase()
      if (m.includes('online') || m.includes('remoto') || m.includes('online'))
        return 'ONLINE'
      return 'IN_PERSON'
    }

    if (isComplete && confirmationWords.includes(lowerMsg)) {
      try {
        await this.scheduleAppointment({
          whatsappNumber: cleanNumber,
          professionalName: context.data.professional,
          startDateTime: new Date(context.data.datetime),
          modality: normalizeModality(context.data.modality),
        })

        await this.deleteConversationContext(cleanNumber)

        return `✅ *Agendamento Confirmado!*
      
🩺 *Profissional:* ${context.data.professional}
📅 *Data:* ${dayjs(context.data.datetime).format('DD/MM/YYYY')}
⏰ *Horário:* ${dayjs(context.data.datetime).format('HH:mm')}
📍 *Modalidade:* ${context.data.modality === 'online' ? 'Remoto' : 'Presencial'}

Tudo pronto! Te enviamos os detalhes por aqui. Até lá!`
      } catch (error: any) {
        const errorMessage =
          error.response?.message || error.message || 'Erro inesperado'
        return `❌ *Não foi possível finalizar:* ${errorMessage}`
      }
    }

    // 2. INTERCEPTAÇÃO DE LISTAGEM DE PROFISSIONAIS
    if (lowerMsg.includes('profissionais') || lowerMsg.includes('quem são')) {
      const professionals = (await this.listProfessionals()) || []
      const list = professionals.map((p) => `- ${p.name}`).join('\n')
      return `Nossos profissionais disponíveis são:\n${list}\n\nQual deles você deseja agendar?`
    }

    // 3. PREPARAÇÃO DO CONTEXTO PARA OPENAI
    const professionals = (await this.listProfessionals()) || []
    const professionalsListText = professionals
      .map((p) => `- ${p.name}`)
      .join('\n')
    const todayFormatted = dayjs().format('dddd, DD [de] MMMM [de] YYYY')

    const response = await this.openAiService.chat(
      [
        {
          role: 'system',
          content: `Você é a MindAI. Hoje é ${todayFormatted}.
      
        REGRA CRÍTICA DE PRIVACIDADE:
        - NUNCA peça IDs de cliente ou profissional. Identificamos pelo WhatsApp.
        - Peça APENAS: Nome do Profissional, Data/Hora e Modalidade.

        MODALIDADES ACEITAS:
        - Se o usuário quiser presencial, use: "IN_PERSON"
        - Se o usuário quiser remoto/online/videochamada, use: "ONLINE"
        
        LISTA DE PROFISSIONAIS CADASTRADOS (USE EXATAMENTE ESTES NOMES):
        ${professionalsListText}

        DADOS NA MEMÓRIA:
        - Profissional: ${context.data.professional || 'NÃO DEFINIDO'}
        - Data/Hora: ${context.data.datetime || 'NÃO DEFINIDO'}
        - Modalidade: ${context.data.modality || 'NÃO DEFINIDO'}

        REGRAS DE VALIDAÇÃO DE NOME:
        1. Você só pode preencher o campo 'professional' se o nome for IDENTIFICÁVEL na lista acima.
        2. Se o usuário digitar apenas o primeiro nome (ex: "Pedro"), mas na lista houver "Dr. Pedro Santos", você DEVE converter para o nome completo "Dr. Pedro Santos" ao chamar a função.
        3. Se o nome fornecido não for minimamente parecido com nenhum da lista, diga que não encontrou o profissional e liste os nomes disponíveis novamente.
        4. NÃO prossiga com 'schedule_appointment' se o nome do profissional estiver como 'NÃO DEFINIDO'.
        5. Ao chamar as funções, o campo 'modality' deve ser estritamente "IN_PERSON" ou "ONLINE".

        FLUXO:
        - Se confirmar (sim/ok) e os dados estiverem completos (com nome da lista), chame 'schedule_appointment'.
        - Se houver dados novos ou correções, chame 'update_appointment_details' sempre normalizando o nome para o formato da lista.`,
        },
        { role: 'user', content: message },
      ],
      openAiFunctions,
    )
    const aiMessage = response.choices[0].message

    // 4. PROCESSAMENTO DE TOOL CALLS
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      const toolCall = aiMessage.tool_calls[0]

      if (toolCall.type === 'function') {
        const functionName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)

        if (functionName === 'update_appointment_details') {
          context.data = {
            professional: args.professional || context.data.professional,
            datetime: args.datetime || context.data.datetime,
            modality: args.modality || context.data.modality,
          }
          await this.saveConversationContext(cleanNumber, context)

          const checkComplete = !!(
            context.data.professional &&
            context.data.datetime &&
            context.data.modality
          )

          if (checkComplete) {
            return (
              `Tudo pronto! Confirme os dados abaixo:\n\n` +
              `🩺 *Profissional:* ${context.data.professional}\n` +
              `📅 *Data/Hora:* ${dayjs(context.data.datetime).format('DD/MM [às] HH:mm')}\n` +
              `📍 *Modalidade:* ${context.data.modality}\n\n` +
              `*Posso confirmar o agendamento?*`
            )
          } else {
            const missing: string[] = []
            if (!context.data.professional) missing.push('Profissional')
            if (!context.data.datetime) missing.push('Data/Hora')
            if (!context.data.modality) missing.push('Modalidade')

            return (
              `Entendi, mas ainda faltam dados: *${missing.join(', ')}*.\n\n` +
              `Por favor, me envie novamente no modelo: "Dr Nome, data e modalidade".`
            )
          }
        }

        if (functionName === 'schedule_appointment') {
          try {
            await this.scheduleAppointment({
              whatsappNumber: cleanNumber,
              professionalName: context.data.professional || args.professional,
              startDateTime: new Date(context.data.datetime || args.datetime),
              modality: context.data.modality || args.modality,
            })
            await this.deleteConversationContext(cleanNumber)
            return `✅ *Agendamento Confirmado!* Até breve.`
          } catch (error: any) {
            return `❌ *Erro:* ${error.response?.message || error.message}`
          }
        }
      }
    }
    // 5. FALLBACK
    await this.saveConversationContext(cleanNumber, context)
    return (
      aiMessage.content || 'Poderia me confirmar os dados para o agendamento?'
    )
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
STATUS ATUAL: ${context.status}

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
   - Ao criar, de imediato exiba que o cadastro foi realizado com sucesso e dê as boas-vindas ao usuário, listando o que você é capaz de fazer e pergunte se ele teria interesse de criar um agendamento.

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
            await this.createClient(functionArgs, cleanNumber)

            await this.deleteConversationContext(cleanNumber)

            const finishedRegisterResponse = await this.openAiService.chat(
              [
                {
                  role: 'system',
                  content: `Você é uma assistente virtual chamanda MindAI de uma clínica de terapia.

O usuário ${sender} acabou de ser cadastrado no sistema.
Sua tarefa é dar as boas-vindas ao usuário, listar o que você é capaz de fazer e perguntar se ele teria interesse de criar um agendamento.

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

            return (
              finishedRegisterResponse.choices[0].message.content ||
              'Parabéns pelo seu cadastro! Estou aqui para ajudar no que precisar. Comigo você pode agendar consultas, conhecer nossos profissionais e tirar dúvidas sobre nossos serviços. Gostaria de agendar uma consulta agora?'
            )
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

  async handleConfirmAppointment(
    message: string,
    cleanNumber: string,
    appointmentId: string,
  ) {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      throw new BadRequestException('Agendamento não encontrado')
    }

    const intent = this.parseReply(message)

    switch (intent) {
      case 'confirm':
        appointment.status = 'CONFIRMED'
        await this.appointmentRepository.save(appointment)
        await this.sendMessage(
          cleanNumber,
          `Consulta confirmada para ${dayjs(appointment.startDateTime).format('DD/MM/YYYY [às] HH:mm')}. Obrigado!`,
        )
        await this.clearPendingConfirmation(cleanNumber)
        // schedule 2h and 30min reminders now that the appointment is confirmed
        try {
          const now = Date.now()
          const startTime = new Date(appointment.startDateTime).getTime()
          const delay2h = startTime - 2 * 60 * 60 * 1000 - now
          if (delay2h > 0) {
            try {
              await this.remindersQueue.add(
                'send-2h-reminder',
                { appointmentId: appointment.id.toString() },
                { delay: delay2h },
              )
            } catch (err) {
              console.error(
                `[WhatsappService] Error adding send-2h-reminder job for appointment ${appointment.id}:`,
                err,
              )
            }
          }

          const delay30min = startTime - 30 * 60 * 1000 - now
          if (delay30min > 0) {
            try {
              await this.remindersQueue.add(
                'send-30min-reminder',
                { appointmentId: appointment.id.toString() },
                { delay: delay30min },
              )
            } catch (err) {
              console.error(
                `[WhatsappService] Error adding send-30min-reminder job for appointment ${appointment.id}:`,
                err,
              )
            }
          }
        } catch (err) {
          console.error(
            '[WhatsappService] Error scheduling post-confirmation reminders:',
            err,
          )
        }
        break

      case 'cancel':
        appointment.status = 'CANCELLED'
        await this.appointmentRepository.save(appointment)
        await this.sendMessage(
          cleanNumber,
          `Consulta cancelada. Se desejar, posso ajudar a reagendar.`,
        )
        await this.clearPendingConfirmation(cleanNumber)
        // clear any pending auto-cancel job
        try {
          const pendingJobId = await this.getPendingCancelJob(cleanNumber)
          if (pendingJobId) {
            const job = await this.remindersQueue.getJob(pendingJobId)
            if (job) await job.remove()
            await this.clearPendingCancelJob(cleanNumber)
            // cleared pending auto-cancel job
          }
        } catch (err) {
          console.error(
            '[WhatsappService] Error clearing pending auto-cancel job after cancel:',
            err,
          )
        }
        break

      default:
        await this.sendMessage(
          cleanNumber,
          'Não entendi sua resposta. Responda com "confirmar" ou "cancelar".',
        )
    }
  }

  public parseReply(
    message = '',
  ): 'confirm' | 'cancel' | 'reschedule' | 'unknown' {
    const normalize = (text: string) =>
      text
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')

    const t = normalize(message)

    if (/\b(confirmar|confirm|sim|s|1)\b/.test(t)) return 'confirm'
    if (/\b(cancelar|cancela|nao|nao vou|nao consigo|nao deu|n|nao)\b/.test(t))
      return 'cancel'
    if (/\b(reagendar|remarcar|trocar|outro horario|outro horario)\b/.test(t))
      return 'reschedule'

    return 'unknown'
  }

  async markPendingConfirmation(
    whatsappNumber: string,
    appointmentId: string,
    ttlHours = 12,
  ) {
    const key = `whatsapp-pending-confirmation-${whatsappNumber}`
    await this.cacheManager.set(key, appointmentId, 1000 * 60 * 60 * ttlHours)
  }

  async setPendingCancelJob(
    whatsappNumber: string,
    jobId: string | number,
    ttlHours = 12,
  ) {
    const key = `whatsapp-pending-confirmation-job-${whatsappNumber}`
    await this.cacheManager.set(
      key,
      jobId.toString(),
      1000 * 60 * 60 * ttlHours,
    )
  }

  async getPendingCancelJob(whatsappNumber: string) {
    const key = `whatsapp-pending-confirmation-job-${whatsappNumber}`
    return (await this.cacheManager.get<string | null>(key)) || null
  }

  async clearPendingCancelJob(whatsappNumber: string) {
    const key = `whatsapp-pending-confirmation-job-${whatsappNumber}`
    await this.cacheManager.del(key)
  }

  async getPendingConfirmation(whatsappNumber: string) {
    const key = `whatsapp-pending-confirmation-${whatsappNumber}`
    return (await this.cacheManager.get<string | null>(key)) || null
  }

  async clearPendingConfirmation(whatsappNumber: string) {
    const key = `whatsapp-pending-confirmation-${whatsappNumber}`
    await this.cacheManager.del(key)
  }

  async handleIncompleteConversation(conversationId: string) {
    const conversation = await this.getConversation(conversationId)

    if (!conversation) {
      throw new BadRequestException('Conversation not found')
    }

    if (conversation.status === 'awaiting_registration_confirmation') {
      const lastMessage = conversation.lastInteraction
      const timeSinceLastMessage = Date.now() - lastMessage!.getTime()

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
      return data
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      throw error
    }
  }

  async processMessage(
    message: string,
    whatsappId: string,
    sender: string,
    messageId: string,
  ) {
    const lockKey = `processing:${messageId}`
    const isProcessing = await this.cacheManager.get(lockKey)

    if (isProcessing) return

    await this.cacheManager.set(lockKey, true, 30000)
    const cleanNumber = whatsappId.split('@')[0]

    const user = await this.userRepository.findByPhone(cleanNumber)

    if (user) {
      const replyIntent = this.parseReply(message)

      if (
        replyIntent === 'confirm' ||
        replyIntent === 'cancel' ||
        replyIntent === 'reschedule'
      ) {
        const pending = await this.getPendingConfirmation(user.whatsappNumber)
        if (pending)
          return this.handleConfirmAppointment(
            message,
            user.whatsappNumber,
            pending,
          )
      }

      return this.handleRegisteredUserFlow(message, user)
    }

    return this.handleUnregisteredUserFlow(message, cleanNumber, sender)
  }
}
