import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { ConversationFlow, ConversationSession } from '../types'
import { FlowServiceUtil } from '../types/class'

type ScheduleAppointmentArgs = {
  professionalName?: string
  dateTime?: Date
  modality?: 'IN_PERSON' | 'ONLINE'
}

@Injectable()
export class AppointmentFlowService extends FlowServiceUtil<'appointment'> {
  constructor(
    prisma: PrismaService,
    private readonly appointmentRepository: AppointmentsRepository,
  ) {
    super(prisma)
  }

  async handle(
    session: ConversationSession<'appointment'>,
    aiIntent: ConversationFlow,
    message: string,
  ) {
    //   switch (session.currentStep) {
    //     case AppointmentFlowSteps.START:
    //       session.contextData = {
    //         whatsappNumber: session.contextData.whatsappNumber,
    //         professionalName: args.professionalName,
    //         startDateTime: args.dateTime,
    //         modality: args.modality,
    //       }
    //       return this.start(session)
    //     case AppointmentFlowSteps.ASK_PROFESSIONAL:
    //       session.contextData.professionalName = args.professionalName
    //       if (!args.professionalName) {
    //         return this.askProfessional(session)
    //       }
    //     case AppointmentFlowSteps.ASK_DATE_TIME:
    //       session.contextData.startDateTime = args.dateTime
    //       if (!args.dateTime) {
    //         return this.askDateTime(session)
    //       }
    //     case AppointmentFlowSteps.ASK_MODALITY:
    //       session.contextData.modality = args.modality
    //       if (!args.modality) {
    //         return this.askModality(session)
    //       }
    //     case AppointmentFlowSteps.CONFIRM_APPOINTMENT:
    //       return this.confirmAppointment(session)
    //     case AppointmentFlowSteps.APPOINTMENT_CONFIRMED:
    //       const userResponse = args.professionalName?.toLowerCase() || ''
    //       return this.scheduleAppointment(userResponse, session)
    //     default:
    //       return `Desculpe, não entendi sua solicitação. Pode repetir?.`
    //   }
    // }
    // private async start(session: ConversationSession<'appointment'>) {
    //   const user = await this.prisma.user.findFirst({
    //     where: { id: session.userId },
    //   })
    //   session.currentStep = AppointmentFlowSteps.ASK_SCHEDULE_DATA
    //   await this.updateSession(session)
    //   return `Olá ${user?.name || 'usuário'}! Para agendarmos sua consulta, por favor, informe o nome do profissional com quem deseja marcar a consulta, a data, horário e a modalidade do atendimento (presencial ou online).
    //           Por exemplo: "Quero agendar uma consulta com o Dr. Silva no dia 15 de março às 14h, atendimento presencial". Caso haja dúvidas quanto ao nome do profissional, você pode solicitar pedindo "olhar profissionais
    //           disponíveis" e verá a lista completa com nome do profissional e modalidade de atendimento.`
    // }
    // private async askProfessional(session: ConversationSession<'appointment'>) {
    //   session.currentStep = AppointmentFlowSteps.ASK_PROFESSIONAL
    //   await this.updateSession(session)
    //   return `Eu não consegui identificar o profissional desejado. Por favor, informe o nome completo do profissional com quem deseja agendar a consulta.`
    // }
    // private async askDateTime(session: ConversationSession<'appointment'>) {
    //   session.currentStep = AppointmentFlowSteps.ASK_DATE_TIME
    //   await this.updateSession(session)
    //   return `Eu não consegui identificar a data e horário desejados. Por favor, informe a data e horário para agendar a consulta. Você pode dizer, por exemplo, "15 de março às 14h", ou "amanhã às 10h".`
    // }
    // private async askModality(session: ConversationSession<'appointment'>) {
    //   session.currentStep = AppointmentFlowSteps.ASK_MODALITY
    //   await this.updateSession(session)
    //   return `Eu não consegui identificar a modalidade do atendimento. Por favor, informe se deseja atendimento presencial ou online.`
    // }
    // private async confirmAppointment(
    //   session: ConversationSession<'appointment'>,
    // ) {
    //   session.currentStep = AppointmentFlowSteps.CONFIRM_APPOINTMENT
    //   await this.updateSession(session)
    //   const { professionalName, startDateTime, modality } = session.contextData
    //   return `Confirme os detalhes do agendamento:\nProfissional: ${professionalName}\nData e Hora: ${startDateTime}\nModalidade: ${modality}\nPor favor, responda com "sim" para confirmar ou "não" para cancelar.`
    // }
    // private async scheduleAppointment(
    //   userResponse: string,
    //   session: ConversationSession<'appointment'>,
    // ) {
    //   const agreedResponses = [
    //     'sim',
    //     'confirm',
    //     'confirmar',
    //     'claro',
    //     'positivo',
    //     'otimo',
    //     'afirmativo',
    //     'excelente',
    //   ]
    //   const declineResponses = [
    //     'não',
    //     'nao',
    //     'cancelar',
    //     'negativo',
    //     'não quero',
    //     'não desejo',
    //     'não confirmar',
    //     'recusar',
    //   ]
    //   if (!userResponse) {
    //     return this.confirmAppointment(session)
    //   }
    //   const { professionalName, startDateTime, modality, clientId } =
    //     session.contextData
    //   if (declineResponses.includes(userResponse.toLowerCase())) {
    //     session.currentStep = AppointmentFlowSteps.FINISH
    //     await this.updateSession(session)
    //     return `O agendamento foi cancelado conforme sua solicitação. Se precisar de algo mais, estou à disposição!`
    //   }
    //   if (agreedResponses.includes(userResponse.toLowerCase())) {
    //     const professional = await this.prisma.user.findFirst({
    //       where: { name: professionalName, role: 'PROFESSIONAL' },
    //       include: { professional: true },
    //     })
    //     if (!professional) {
    //       session.currentStep = AppointmentFlowSteps.ASK_PROFESSIONAL
    //       await this.updateSession(session)
    //       return `Desculpe, não consegui encontrar o profissional ${professionalName}. Por favor, verifique o nome e tente novamente.`
    //     }
    //     const professionalScheduleConfiguration =
    //       await this.prisma.scheduleConfiguration.findFirst({
    //         where: {
    //           professionalId: professional.id,
    //         },
    //       })
    //     if (!professionalScheduleConfiguration) {
    //       session.currentStep = AppointmentFlowSteps.FINISH
    //       await this.updateSession(session)
    //       return `Desculpe, o profissional ${professionalName} não possui uma configuração de agenda válida. Por favor, entre em contato com o suporte para mais informações.`
    //     }
    //     const endDate = dayjs(startDateTime)
    //       .add(professionalScheduleConfiguration.sessionDurationMinutes, 'minute')
    //       .toDate()
    //     const appointment = Appointment.create({
    //       clientId: new UniqueEntityId(clientId),
    //       professionalId: new UniqueEntityId(professional.id),
    //       startDateTime: startDateTime!,
    //       endDateTime: endDate,
    //       modality: modality!,
    //       agreedPrice: Number(professional.professional?.sessionPrice),
    //     })
    //     await this.appointmentRepository.create(appointment)
    //     session.currentStep = AppointmentFlowSteps.FINISH
    //     await this.updateSession(session)
    //   }
    //   return `Nao consegui entender sua resposta. Por favor, responda com "sim" para confirmar o agendamento ou "não" para cancelar.`
    // }
  }
}
