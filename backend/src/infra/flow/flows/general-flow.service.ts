import { AppointmentsRepository } from '@/domain/scheduling/application/repositories/appointments.repository'
import { ClientRepository } from '@/domain/scheduling/application/repositories/client.repository'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { OpenAiService } from '../../../infra/webhooks/openai/openai.service'
import { ConversationSession } from '../types'

@Injectable()
export class GeneralFlowService {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly openai: OpenAiService,
    private readonly appointmentRepository: AppointmentsRepository,
    private readonly clientRepository: ClientRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async handle(message?: string, session?: any) {
    // Se a mensagem indicar desejo de ver agendamentos, delega para listUserAppointments
    if (
      message &&
      /meus agendamentos|ver meus agendamentos|meus agendamento|agendamentos/i.test(
        message,
      ) &&
      session
    ) {
      return this.listUserAppointments(session)
    }

    const response = await this.openai.chat([
      {
        role: 'system',
        content: `Role: Você é o MindAI, um assistente virtual altamente inteligente, educado e empático. Seu objetivo é fornecer respostas bem fundamentadas e atenciosas, mantendo um tom profissional e acolhedor.

    Tom e Estilo:

    Educação e Cortesia: Utilize sempre uma linguagem polida (ex: "Como posso ajudar?", "É um prazer").

    Conteúdo Educado: Suas respostas devem refletir clareza e inteligência, evitando gírias ou respostas excessivamente curtas.

    Engajamento: Você deve ser proativo em ajudar o usuário a organizar o dia ou tarefas.

    Regra de Interação: Em sua resposta, você deve sempre demonstrar prontidão e perguntar ao usuário: "O que você gostaria de fazer hoje?" ou uma variação educada como "Como posso auxiliar em seus planos para o dia de hoje?".

    Idioma: Responda sempre em português brasileiro, de forma gramaticalmente correta e elegante.`,
      },
    ])

    return response.choices[0].message?.content
  }

  async listUserAppointments(session: ConversationSession<'appointment'>) {
    // Busca client pelo session.userId
    const userClient = await this.clientRepository.findByUserId(session.userId)

    if (!userClient) {
      return `Desculpe, não consegui identificar seu cadastro como cliente. Por favor, cadastre-se ou entre em contato com o suporte.`
    }

    const appointments = await this.appointmentRepository.findManyByClientId(
      userClient.id.toString(),
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
      const dayName = start.format('dddd') // sexta-feira
      const time = start.format('HH:mm') // 14:00

      const statusMap: Record<string, string> = {
        SCHEDULED: 'Agendado',
        CONFIRMED: 'Confirmado',
        CANCELLED: 'Cancelado',
        RESCHEDULED: 'Remarcado',
        IN_PROGRESS: 'Em andamento',
        COMPLETED: 'Concluído',
        NO_SHOW: 'Não compareceu',
      }

      const modalityMap: Record<string, string> = {
        IN_PERSON: 'Presencial',
        ONLINE: 'Remoto',
      }

      const status = statusMap[appt.status] || appt.status
      const modality = modalityMap[appt.modality] || appt.modality
      const meet = appt.googleMeetLink || '—'

      // Formato solicitado: "1. Dr. Nome, sexta-feira às 14:00 — Agendado (Remoto)
      // Link: <link>"
      lines.push(
        `${i + 1}. Dr(a). ${professionalName}, ${dayName} às ${time} — ${status} (${modality})\nLink: ${meet}`,
      )
    }

    return `Seus agendamentos:\n\n${lines.join('\n\n')}`
  }
}
