import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { Appointment } from '@/domain/scheduling/enterprise/entities/appointment'
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
      const profNameWords = normalizedProfName.split(/\s+/)

      // Verifica se todos os termos de busca estão presentes no nome do profissional
      const match = searchTerms.every((term) =>
        profNameWords.some(
          (word) => word.includes(term) || term.includes(word),
        ),
      )

      return match
    })

    if (!professional) {
      return null
    }

    console.log(`Found professional: ${professional.name}`)

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

  async handle(
    session: ConversationSession<'appointment'>,
    aiIntent: ConversationFlow,
    message: string,
  ) {
    const data = session.contextData.data

    switch (session.currentStep) {
      case AppointmentFlowSteps.START:
        return this.start(session)

      case AppointmentFlowSteps.COLLECT_DATA:
        await this.extractScheduleAppointmentData(message, session)

      case AppointmentFlowSteps.CONFIRM_APPOINTMENT:
        return this.handleConfirmationResponse(session, message)

      case AppointmentFlowSteps.ASK_PROFESSIONAL:
        session.contextData.data.professionalName = message
        session.currentStep = AppointmentFlowSteps.CONFIRM_APPOINTMENT
        await this.updateSession(session)
        return this.showConfirmation(session)

      case AppointmentFlowSteps.ASK_DATE_TIME:
        // Extrai a data e horário da mensagem do usuário
        await this.extractScheduleAppointmentData(message, session)
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

  private async extractScheduleAppointmentData(
    userResponse: string,
    session: ConversationSession<'appointment'>,
  ) {
    try {
      const fields = (await this.openai.extractScheduleData(
        userResponse,
      )) as FieldsData<CreateAppointmentBodyDTO>

      // Normaliza startDateTime para Date se vier como string
      if (
        fields.data.startDateTime &&
        typeof fields.data.startDateTime === 'string'
      ) {
        fields.data.startDateTime = new Date(fields.data.startDateTime)
      }

      session.contextData.data = fields.data
      session.contextData.missingFields = fields.missingFields

      session.currentStep = AppointmentFlowSteps.CONFIRM_APPOINTMENT
      await this.updateSession(session)
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
    console.log(session)

    try {
      const { startDateTime, modality } = session.contextData.data

      await this.getClientByUserId(session.userId)

      if (!this.client) {
        await this.finishSession(session)
        return `Desculpe, não consegui identificar seu cadastro como cliente. Por favor, entre em contato com o suporte para mais informações.`
      }

      console.log(this.client)

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

      const endDate = dayjs(startDateTime)
        .add(professionalScheduleConfiguration.sessionDurationMinutes, 'minute')
        .toDate()

      const appointment = Appointment.create({
        clientId: this.client.id,
        professionalId: this.professional.professionalId,
        startDateTime: startDateTime!,
        endDateTime: endDate,
        modality: modality!,
        agreedPrice: this.professionalSessionPrice!,
      })

      await this.appointmentRepository.create(appointment)
      await this.finishSession(session)

      return `✅ *Agendamento confirmado com sucesso!*\n\n🩺 Profissional: ${this.professional.name}\n📅 Data e horário: ${dayjs(startDateTime).locale('pt-br').format('DD/MM/YYYY (dddd) [às] HH:mm')}\n🖥️ Modalidade: ${modality === 'IN_PERSON' ? 'Presencial' : 'Online'}\n💰 Valor: R$${this.professionalSessionPrice?.toFixed(2)}\n\nSe precisar de mais alguma coisa, estou à disposição!`
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      return `Desculpe, ocorreu um erro ao agendar sua consulta. Por favor, tente novamente mais tarde.`
    }
  }
}
