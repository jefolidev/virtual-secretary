import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { CreateAppointmentUseCase } from '@/domain/scheduling/application/use-cases/create-schedule'
import { NoDisponibilityError } from '@/domain/scheduling/application/use-cases/errors/no-disponibility-error'
import { Client } from '@/domain/scheduling/enterprise/entities/client'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { UserProfessionalWithSettings } from '@/domain/scheduling/enterprise/entities/value-objects/user-professional-with-settings'
import { CreateAppointmentBodyDTO } from '@/infra/webhooks/whatsapp/dto/create-appointment.dto'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import 'tsconfig-paths/register'
import { OpenAiService } from '../../../infra/webhooks/openai/openai.service'
import { PrismaService } from '../../database/prisma/prisma.service'
import {
  AppointmentFlowSteps,
  ConversationFlow,
  ConversationSession,
  FieldsData,
} from '../types'
import { FlowServiceUtil } from '../types/class'
import { agreedResponses, declineResponses } from '../utils/responses'
import { GeneralFlowService } from './general-flow.service'

@Injectable()
export class AppointmentFlowService extends FlowServiceUtil<'appointment'> {
  private professional: User | undefined
  private professionalSessionPrice: number | undefined
  private client: Client | null = null

  constructor(
    prisma: PrismaService,

    private readonly appointmentRepository: AppointmentsRepository,
    private readonly clientRepository: ClientRepository,
    private readonly professionalRepository: ProfessionalRepository,
    private readonly userRepository: UserRepository,

    private readonly openai: OpenAiService,
    private readonly generalFlowService: GeneralFlowService,
    private readonly scheduleAppointmentUseCase: CreateAppointmentUseCase,
  ) {
    super(prisma)
  }

  private async getProfessionalScheduleConfiguration(
    professionalName: string,
  ): Promise<UserProfessionalWithSettings | null> {
    const professionals = await this.userRepository.findManyProfessionalUsers()

    if (!professionals) {
      return null
    }

    // Normaliza o nome buscado (lowercase, remove acentos e pontuação)
    const normalizeString = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove pontuação
        .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
        .trim()

    const searchTerms = normalizeString(professionalName).split(/\s+/)

    const professional = professionals.find((professional) => {
      const normalizedProfName = normalizeString(professional.name)

      return searchTerms.every((term) => normalizedProfName.includes(term))
    })

    if (!professional) {
      return null
    }

    const professionalSessionPrice = await this.prisma.professional.findFirst({
      where: { id: professional?.professionalId?.toString() },
      select: { sessionPrice: true },
    })

    this.professional = professional
    this.professionalSessionPrice = Number(
      professionalSessionPrice?.sessionPrice,
    )

    const professionalScheduleConfiguration =
      await this.professionalRepository.findByProfessionalIdWithSettings(
        professional.professionalId!.toString(),
      )

    console.log(
      `Schedule configuration found: ${professionalScheduleConfiguration ? 'YES' : 'NO'}`,
    )

    return professionalScheduleConfiguration
  }

  private async getClientByUserId(userId: string): Promise<Client | null> {
    const client = await this.clientRepository.findByUserId(userId)
    this.client = client
    console.log(client)

    return client
  }

  private async listUserAppointments(
    session: ConversationSession<'appointment'>,
  ) {
    await this.getClientByUserId(session.userId)

    if (!this.client) {
      return `Desculpe, não consegui identificar seu cadastro como cliente. Por favor, cadastre-se ou entre em contato com o suporte.`
    }

    const appointments = await this.appointmentRepository.findManyByClientId(
      this.client.id.toString(),
      { page: 1 },
    )

    if (!appointments || appointments.length === 0) {
      return 'Você não possui agendamentos no momento.'
    }

    const lines: string[] = []

    for (let i = 0; i < appointments.length; i++) {
      const appt = appointments[i]

      // Busca nome do profissional
      let professionalName = 'Profissional'
      try {
        const profUser = await this.userRepository.findByProfessionalId(
          appt.professionalId.toString(),
        )
        professionalName = profUser?.name || professionalName
      } catch (e) {
        // ignore
      }

      const start = dayjs(appt.startDateTime).locale('pt-br')
      const formattedDate = start.format('DD/MM/YYYY (dddd) [às] HH:mm')
      const modality = appt.modality === 'IN_PERSON' ? 'Presencial' : 'Online'
      const status = appt.status
      const meet = appt.googleMeetLink || '—'

      lines.push(
        `${i + 1}. ${formattedDate} — ${professionalName} — ${modality} — ${status}\nLink: ${meet}`,
      )
    }

    return `Seus agendamentos:\n\n${lines.join('\n\n')}`
  }

  async handle(
    session: ConversationSession<'appointment'>,
    aiIntent: ConversationFlow,
    message: string,
  ) {
    const data = session.contextData.data
    console.log(aiIntent)

    if (
      aiIntent === ConversationFlow.LIST_PROFESSIONAL &&
      /lista|listar|mostrar|ver|profissionais|profissional/i.test(message)
    ) {
      session.currentStep = AppointmentFlowSteps.LIST_PROFESSIONALS
      await this.updateSession(session)
    }

    if (
      aiIntent === ConversationFlow.LIST_CLIENT_APPOINTMENT ||
      /meus agendamentos|ver meus agendamentos|meus agendamento|agendamentos/i.test(
        message,
      )
    ) {
      return await this.generalFlowService.listUserAppointments(session)
    }

    switch (session.currentStep) {
      case AppointmentFlowSteps.START:
        return this.start(session)

      case AppointmentFlowSteps.LIST_PROFESSIONALS:
        session.currentStep = AppointmentFlowSteps.ASK_PROFESSIONAL
        await this.updateSession(session)
        return this.listProfessionals()

      case AppointmentFlowSteps.COLLECT_DATA:
        return await this.extractScheduleAppointmentData(message, session)

      case AppointmentFlowSteps.CONFIRM_APPOINTMENT:
        return await this.handleConfirmationResponse(session, message)

      case AppointmentFlowSteps.ASK_PROFESSIONAL:
        session.contextData.data.professionalName = message
        session.currentStep = AppointmentFlowSteps.CONFIRM_APPOINTMENT
        await this.updateSession(session)
        return this.showConfirmation(session)

      case AppointmentFlowSteps.ASK_DATE_TIME:
        console.log('entrou aqui')
        const extractResult = await this.extractScheduleAppointmentData(
          message,
          session,
        )

        if (typeof extractResult === 'string') {
          // erro durante extração — retorna mensagem de erro para o usuário
          return extractResult
        }

        return this.showConfirmation(session)

      case AppointmentFlowSteps.ASK_MODALITY:
        // Extrai a modalidade da mensagem do usuário
        const modalityLower = message.toLowerCase()
        if (
          modalityLower.includes('presencial') ||
          modalityLower.includes('in person')
        ) {
          session.contextData.data.modality = 'IN_PERSON'
        } else if (
          modalityLower.includes('online') ||
          modalityLower.includes('remot')
        ) {
          session.contextData.data.modality = 'ONLINE'
        }
        session.currentStep = AppointmentFlowSteps.CONFIRM_APPOINTMENT
        await this.updateSession(session)
        return this.showConfirmation(session)

      case AppointmentFlowSteps.CHANGE_DATA:
        session.currentStep = AppointmentFlowSteps.COLLECT_DATA
        await this.updateSession(session)
        return this.extractScheduleAppointmentData(message, session)

      case AppointmentFlowSteps.APPOINTMENT_CONFIRMED:
        const userResponse = data.professionalName?.toLowerCase() || ''
        return this.scheduleAppointment(userResponse, session)

      default:
        return `Desculpe, não entendi sua solicitação. Pode repetir?.`
    }
  }

  private async start(session: ConversationSession<'appointment'>) {
    const user = await this.prisma.user.findFirst({
      where: { id: session.userId },
    })

    session.currentStep = AppointmentFlowSteps.COLLECT_DATA
    await this.updateSession(session)
    return `Olá ${user?.name || 'usuário'}! Para agendarmos sua consulta, por favor, informe o nome do profissional com quem deseja marcar a consulta, a data, horário e a modalidade do atendimento (presencial ou online).

              Por exemplo: "Quero agendar uma consulta com o Dr. Silva no dia 15 de março às 14h, atendimento presencial". Caso haja dúvidas quanto ao nome do profissional, você pode solicitar pedindo "olhar profissionais disponíveis" e verá a lista completa com nome do profissional e modalidade de atendimento.`
  }

  async listProfessionals() {
    const professionals =
      await this.professionalRepository.findManyProfessionalsAndSettings()

    if (!professionals || professionals.length === 0) {
      return 'Não foi enconntrado nenhum profissional, entre em contato com o suporte.'
    }

    const professionalList = professionals.map((prof, idx) => ({
      nome: prof.name,
      email: prof.email,
      organizacao: prof.organization?.name || null,
    }))

    const response = `Aqui estão os profissionais disponíveis:
    ${professionalList
      .map((prof, idx) => {
        const name = prof.nome
        const email = prof.email
        const organization = prof.organizacao

        return `
      ${idx + 1}. *${name}*
          Email: ${email}
          ${organization ? `Organização: ${organization}\n` : ''}`
      })
      .join('')}
Por favor, informe o nome completo do profissional com quem deseja agendar a consulta.`

    return response
  }

  private async extractScheduleAppointmentData(
    userResponse: string,
    session: ConversationSession<'appointment'>,
  ) {
    try {
      const extracted = (await this.openai.extractScheduleData(
        userResponse,
      )) as FieldsData<CreateAppointmentBodyDTO> | null

      console.log(userResponse, extracted)

      let fields: FieldsData<CreateAppointmentBodyDTO> | null = extracted

      if (!fields || !fields.data) {
        console.log(
          'extractScheduleData returned empty, trying fallbacks:',
          fields,
        )
        await this.updateSession(session)

        const fallbackFields = { data: {}, missingFields: [] } as any

        try {
          const dateOnly = await this.openai.extractDateOnly(userResponse)
          if (dateOnly && dateOnly.startDateTime) {
            fallbackFields.data.startDateTime = new Date(dateOnly.startDateTime)
          }

          const profOnly =
            await this.openai.extractProfessionalOnly(userResponse)
          if (profOnly && profOnly.professionalName) {
            fallbackFields.data.professionalName = profOnly.professionalName
          }

          const modalityOnly =
            await this.openai.extractModalityOnly(userResponse)
          if (modalityOnly && modalityOnly.modality) {
            fallbackFields.data.modality = modalityOnly.modality
          }
        } catch (e) {
          console.error('fallback extractors failed:', e)
        }

        // Se os fallbacks não retornarem nada, pedir explicitamente a data/hora
        if (Object.keys(fallbackFields.data).length === 0) {
          return this.askDateTime(session)
        }

        fields = fallbackFields
      }

      // fields já garantido não-nulo acima (se fosse nulo teríamos retornado askDateTime)
      const parsedFields = fields as FieldsData<CreateAppointmentBodyDTO>

      if (
        parsedFields.data.startDateTime &&
        typeof parsedFields.data.startDateTime === 'string'
      ) {
        parsedFields.data.startDateTime = new Date(
          parsedFields.data.startDateTime,
        )
      }

      session.contextData.data = {
        ...(session.contextData.data || {}),
        ...parsedFields.data,
      }
      session.contextData.missingFields = parsedFields.missingFields

      session.currentStep = AppointmentFlowSteps.CONFIRM_APPOINTMENT
      await this.updateSession(session)

      if (
        session.contextData.data.professionalName &&
        session.contextData.data.modality &&
        session.contextData.data.startDateTime
      ) {
        return this.showConfirmation(session)
      }

      if (
        session.contextData.data.professionalName &&
        session.contextData.data.modality &&
        !session.contextData.data.startDateTime
      ) {
        session.currentStep = AppointmentFlowSteps.ASK_DATE_TIME
        await this.updateSession(session)
        return this.askDateTime(session)
      }
    } catch (error) {
      console.error('Error extracting schedule data:', error)
      return `Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.`
    }
  }

  private async askProfessional(session: ConversationSession<'appointment'>) {
    session.currentStep = AppointmentFlowSteps.ASK_PROFESSIONAL
    await this.updateSession(session)
    return `Eu não consegui identificar o profissional desejado. Por favor, informe o nome completo do profissional com quem deseja agendar a consulta.`
  }

  private async askDateTime(session: ConversationSession<'appointment'>) {
    session.currentStep = AppointmentFlowSteps.ASK_DATE_TIME
    await this.updateSession(session)
    return `Eu não consegui identificar a data e horário desejados. Por favor, informe a data e horário para agendar a consulta. Você pode dizer, por exemplo, "15 de março às 14h", ou "amanhã às 10h".`
  }

  private async askModality(session: ConversationSession<'appointment'>) {
    session.currentStep = AppointmentFlowSteps.ASK_MODALITY
    await this.updateSession(session)
    return `Eu não consegui identificar a modalidade do atendimento. Por favor, informe se deseja atendimento presencial ou online.`
  }

  private async showConfirmation(session: ConversationSession<'appointment'>) {
    const { professionalName, startDateTime, modality } =
      session.contextData.data

    if (!professionalName) {
      return this.askProfessional(session)
    }

    if (!startDateTime) {
      console.log(
        `Asking for date time, current data: ${JSON.stringify(
          session.contextData.data,
        )}`,
      )
      return this.askDateTime(session)
    }

    if (!modality) {
      return this.askModality(session)
    }

    const professionalScheduleConfiguration =
      await this.getProfessionalScheduleConfiguration(professionalName)

    if (!professionalScheduleConfiguration) {
      session.currentStep = AppointmentFlowSteps.ASK_PROFESSIONAL
      await this.updateSession(session)

      console.log(
        `Professional schedule configuration not found for: ${professionalScheduleConfiguration}`,
      )

      if (this.professional) {
        return `Encontrei o(a) profissional *${this.professional.name}*, mas infelizmente ele(a) ainda não possui uma configuração de agenda disponível. Por favor, entre em contato com o suporte ou escolha outro profissional.`
      }

      console.log(professionalName)

      return `Desculpe, não consegui encontrar nenhum profissional com o nome "${professionalName}". Por favor, verifique o nome e tente novamente ou peça para ver a lista de profissionais disponíveis.`
    }

    const scheduleSettings =
      professionalScheduleConfiguration.scheduleConfiguration!

    // Mapeia números para dias da semana usando dayjs
    const workingDaysNames = scheduleSettings?.workingDays.currentItems
      .map((day) => dayjs().day(day).locale('pt-br').format('dddd'))
      .join(', ')

    // Formata data e calcula horário de término
    const startDate = dayjs(startDateTime).locale('pt-br')
    const endDate = startDate.add(
      scheduleSettings.sessionDurationMinutes,
      'minute',
    )
    const formattedDateTime = `${startDate.format('DD/MM/YYYY')} (${startDate.format('dddd')}) das ${startDate.format('HH:mm')} às ${endDate.format('HH:mm')}`

    return `O(A) Profissional *${professionalName}* possui a seguinte configuração de agenda:\n\n- Dias disponíveis: ${workingDaysNames}\n- Horário de atendimento: ${scheduleSettings?.workingHours.start} às ${scheduleSettings?.workingHours.end}\n- Duração da sessão: ${scheduleSettings.sessionDurationMinutes} minutos\n- Preço por sessão: R$${this.professionalSessionPrice?.toFixed(
      2,
    )}\n
    Confirme os detalhes do agendamento:\n\n🩺 *Profissional*: ${this.professional?.name}\n📅 *Data e Horário*: ${formattedDateTime}\n🖥️ *Modalidade*: ${modality === 'IN_PERSON' ? 'Presencial' : 'Online'}\n\nPor favor, responda com "*sim*" para confirmar, "*não*" para cancelar ou "*alterar*" para modificar os detalhes.`
  }

  private async handleConfirmationResponse(
    session: ConversationSession<'appointment'>,
    userResponse: string,
  ) {
    const responseLower = userResponse.toLowerCase()

    if (
      responseLower.includes('alterar') ||
      responseLower.includes('mudar') ||
      responseLower.includes('trocar')
    ) {
      session.currentStep = AppointmentFlowSteps.CHANGE_DATA
      session.contextData.missingFields = []
      session.contextData.data = {}
      await this.updateSession(session)
      return `Ok! Vamos alterar os dados do agendamento. Por favor, informe os dados novamente para seguir com o agendamento:\n\n- Profissional\n- Data e horário\n- Modalidade\n\n.`
    }

    if (declineResponses.includes(responseLower)) {
      session.currentStep = AppointmentFlowSteps.DECLINE_APPOINTMENT
      await this.updateSession(session)
      return this.cancelOrRescheduleAppointment(session, userResponse)
    }

    if (agreedResponses.includes(responseLower)) {
      session.currentStep = AppointmentFlowSteps.APPOINTMENT_CONFIRMED
      await this.updateSession(session)
      return this.scheduleAppointment(userResponse, session)
    }

    return this.showConfirmation(session)
  }

  private async cancelOrRescheduleAppointment(
    session: ConversationSession<'appointment'>,
    userDecision: string,
  ) {
    if (userDecision.toLowerCase().includes('alterar')) {
      session.currentStep = AppointmentFlowSteps.CHANGE_DATA
      await this.updateSession(session)
      return `O agendamento não foi confirmado. Por favor, informe os novos detalhes para o agendamento, incluindo o nome do profissional, data, horário e modalidade (presencial ou online).`
    }
    await this.finishSession(session)
    return `O agendamento foi cancelado conforme sua solicitação. Se precisar de algo mais, estou à disposição!`
  }

  private async scheduleAppointment(
    userResponse: string,
    session: ConversationSession<'appointment'>,
  ) {
    try {
      const { startDateTime, modality } = session.contextData.data

      await this.getClientByUserId(session.userId)

      if (!this.client) {
        await this.finishSession(session)
        return `Desculpe, não consegui identificar seu cadastro como cliente. Por favor, entre em contato com o suporte para mais informações.`
      }

      if (!this.professional || !this.professional.professionalId) {
        session.currentStep = AppointmentFlowSteps.ASK_PROFESSIONAL
        await this.updateSession(session)
        return `Desculpe, não consegui identificar o profissional. Por favor, tente novamente.`
      }

      const professionalScheduleConfiguration =
        await this.prisma.scheduleConfiguration.findFirst({
          where: {
            professionalId: this.professional.professionalId.toString(),
          },
        })
      if (!professionalScheduleConfiguration) {
        await this.finishSession(session)
        return `Desculpe, o profissional ${this.professional.name} não possui uma configuração de agenda válida. Por favor, entre em contato com o suporte para mais informações.`
      }

      const user = await this.userRepository.findByClientId(
        this.client.id.toString(),
      )

      if (!user) {
        await this.finishSession(session)
        return `Desculpe, não consegui identificar seu cadastro como cliente. Por favor, entre em contato com o suporte para mais informações.`
      }

      const shouldSyncWithGoogleCalendar = this.prisma.professional.findUnique({
        where: { id: this.professional.professionalId.toString() },
        select: { googleCalendarTokens: true },
      })

      const result = await this.scheduleAppointmentUseCase.execute({
        clientId: this.client.id.toString(),
        professionalId: this.professional.professionalId.toString(),
        startDateTime: startDateTime!,
        googleMeetLink: '',
        modality: modality!,
        syncWithGoogleCalendar:
          shouldSyncWithGoogleCalendar.googleCalendarTokens.length > 0,
      })

      if (result.isLeft()) {
        const error = result.value
        // Mensagens amigáveis para o usuário no fluxo de conversa
        if (error.constructor === NoDisponibilityError) {
          session.currentStep = AppointmentFlowSteps.ASK_DATE_TIME
          await this.updateSession(session)
          return `Desculpe, este horário já está ocupado. Por favor, responda com outro horário (por exemplo "amanhã às 15h").`
        }

        if (error.constructor === NotFoundError) {
          return `Desculpe, não foi possível concluir o agendamento: ${
            (error as any).message
          }. Por favor, tente novamente ou entre em contato com o suporte.`
        }

        if (error.constructor === NotAllowedError) {
          return `Desculpe, você não tem permissão para realizar esta ação: ${
            (error as any).message
          }.`
        }

        return `Desculpe, ocorreu um erro ao processar seu agendamento: ${
          (error as any)?.message ?? 'Erro desconhecido'
        }. Por favor, tente novamente mais tarde.`
      }

      await this.finishSession(session)

      return `✅ *Agendamento confirmado com sucesso!*\n\n🩺 Profissional: ${this.professional.name}\n📅 Data e horário: ${dayjs(startDateTime).locale('pt-br').format('DD/MM/YYYY (dddd) [às] HH:mm')}\n🖥️ Modalidade: ${modality === 'IN_PERSON' ? 'Presencial' : 'Online'}\n💰 Valor: R$${this.professionalSessionPrice?.toFixed(2)}\n\nSe precisar de mais alguma coisa, estou à disposição! Envie "ver meus agendamentos" para ver seus agendamentos e conferir o link para a reunião no Google Meet.`
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      return `Desculpe, ocorreu um erro ao agendar sua consulta. Por favor, tente novamente mais tarde.`
    }
  }
}
