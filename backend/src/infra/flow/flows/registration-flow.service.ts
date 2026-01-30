import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Env } from '@/infra/env/env'
import { OpenAiService } from '@/infra/webhooks/openai/openai.service'
import { CreateClientBodyDTO } from '@/infra/webhooks/whatsapp/dto/create-client.dto'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ConversationFlow,
  ConversationSession,
  FieldsData,
  RegistrationFlowSteps,
} from '../types'
import { FlowServiceUtil } from '../types/class'

export interface RegistrationData {
  name: string
  email: string
  cpf: string
  birthDate: string
  gender: string
  cep: string
  number: string
  complement?: string
  periodPreference: string[]
  extraPreferences?: string
  whatsappNumber?: string
}

@Injectable()
export class RegistrationFlowService extends FlowServiceUtil<'registration'> {
  agreedResponses = [
    'sim',
    'confirm',
    'confirmar',
    'claro',
    'positivo',
    'otimo',
    'afirmativo',
    'excelente',
  ]

  declineResponses = [
    'não',
    'nao',
    'cancelar',
    'negativo',
    'não quero',
    'não desejo',
    'não confirmar',
    'recusar',
  ]

  constructor(
    prisma: PrismaService,

    private readonly openAiService: OpenAiService,
    private readonly userRepository: UserRepository,

    private readonly configService: ConfigService<Env, true>,
  ) {
    super(prisma)
  }

  async handle(
    session: ConversationSession<'registration'>,
    aiIntent: ConversationFlow,
    message: string,
  ) {
    switch (session.currentStep) {
      case RegistrationFlowSteps.START:
        const response = await this.start(session)
        return response

      case RegistrationFlowSteps.ASK_CONFIRMATION:
        return this.askConfirmation(message, session)

      case RegistrationFlowSteps.COLLECT_DATA:
        return await this.collectData(
          message,
          session,
          session.contextData.whatsappNumber,
        )

      default:
        throw new Error(
          `Step ${session.currentStep} in registration flow not implemented`,
        )
    }
  }

  private async start(session: ConversationSession<'registration'>) {
    session.currentStep = RegistrationFlowSteps.ASK_CONFIRMATION
    await this.updateSession(session)

    return `Olá! Vejo que você ainda não está registrado. Gostaria de criar uma conta para aproveitar todos os recursos disponíveis?`
  }

  private async askConfirmation(
    userResponse: string,
    session: ConversationSession<'registration'>,
  ) {
    if (this.declineResponses.includes(userResponse.toLowerCase())) {
      session.currentStep = RegistrationFlowSteps.FINISHED
      await this.updateSession(session)
      return `Tudo bem! Se mudar de ideia, estarei aqui para ajudar.`
    }

    if (this.agreedResponses.includes(userResponse.toLowerCase())) {
      session.currentStep = RegistrationFlowSteps.COLLECT_DATA
      await this.updateSession(session)
      return `Ótimo! Por criar sua conta, me informe todos os seus dados: 
- Nome completo: 
- Email: 
- CPF:
- Data de nascimento: (DD/MM/AAAA)
- Gênero: (Homem ou Mulher),
- CEP:
- Número residencial:
- Complemento (opcional):
- Período de preferência para atendimentos: (Manhã, Tarde e/ou Noite)
- Preferências extras (opcional):`
    }

    return `Por favor, responda com "sim" para criar uma conta ou "não" se não desejar.`
  }

  private async collectData(
    userResponse: string,
    session: ConversationSession<'registration'>,
    whatsappNumber: string,
  ) {
    const fields = (await this.openAiService.extractRegistrationData(
      userResponse,
    )) as FieldsData<CreateClientBodyDTO>

    session.contextData.data = fields.data
    session.contextData.missingFields = fields.missingFields
    await this.updateSession(session)

    if (!fields) {
      return `Não consegui identificar todos os dados necessários. Por favor, forneça as informações no seguinte formato:
            - Nome completo: 
            - Email: 
            - CPF:
            - Data de nascimento: (DD/MM/AAAA)
            - Gênero (Homem ou Mulher):
            - CEP:
            - Número residencial:
            - Complemento (opcional):
            - Período de preferência para atendimentos: (Manhã, Tarde e/ou Noite)
            - Preferências extras (opcional):`
    }

    if (fields.missingFields.length > 0) {
      return `Faltam os seguintes dados: ${fields.missingFields.join(', ')}. Por favor, reenvie o modelo com os dados, inserindo os dados ausentes.`
    }

    if (!session.contextData.data) {
      return `Não consegui identificar todos os dados necessários. Por favor, forneça as informações no seguinte formato:
            - Nome completo: 
            - Email: 
            - CPF:
            - Data de nascimento: (DD/MM/AAAA)
            - Gênero (Homem ou Mulher):
            - CEP:
            - Número residencial:
            - Complemento (opcional):
            - Período de preferência para atendimentos: (Manhã, Tarde e/ou Noite)
            - Preferências extras (opcional):`
    }

    try {
      await this.userRepository.createClientByWhatsapp({
        name: fields.data.name,
        email: fields.data.email,
        cpf: fields.data.cpf,
        birthDate: new Date(fields.data.birthDate),
        gender: fields.data.gender,
        cep: fields.data.cep,
        number: fields.data.number,
        complement: fields.data.complement ? fields.data.complement : null,
        periodPreference: fields.data.periodPreference,
        extraPreferences: fields.data.extraPreferences
          ? fields.data.extraPreferences
          : '',
        whatsappNumber,
      })

      await this.updateSession(session)
      await this.finishRegistration(session)

      return `Parabéns, ${session.contextData.data.name}! Sua conta foi criada com sucesso. Agora você pode agendar, remarcar ou cancelar sessões conforme sua necessidade. Estou aqui para ajudar no que precisar!`
    } catch (error) {
      console.error('Error creating user:', error)
      return `Houve um erro ao criar sua conta. Por favor, tente novamente mais tarde. ${this.configService.get('NODE_ENV') === 'development' ? `Detalhes do erro: ${JSON.stringify(error, null, 2)}` : ''}`
    }
  }

  async finishRegistration(session: ConversationSession<'registration'>) {
    session.currentStep = RegistrationFlowSteps.FINISHED

    if (session.currentStep === RegistrationFlowSteps.FINISHED) {
      await this.finishSession(session)
      return `Conta criada com sucesso.`
    }
  }
}
