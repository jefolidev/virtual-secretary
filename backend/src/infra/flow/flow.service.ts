import { User } from '@/domain/scheduling/enterprise/entities/user'
import { Injectable } from '@nestjs/common'
import { AppointmentFlowService } from './flows/appointment-flow.service'
import { GeneralFlowService } from './flows/general-flow.service'
import { RegistrationFlowService } from './flows/registration-flow.service'
import {
  ConversationFlow,
  ConversationSession,
  RegistrationFlowSteps,
} from './types'

@Injectable()
export class FlowService {
  constructor(
    private readonly appointmentFlowService: AppointmentFlowService,
    private readonly registrationFlowService: RegistrationFlowService,
    private readonly generalFlowService: GeneralFlowService,
  ) {}

  private async continueFlow(
    session: ConversationSession,
    message: string,
    aiIntent: ConversationFlow,
  ) {
    switch (session.currentFlow) {
      case 'appointment':
        return this.appointmentFlowService.handle(
          session as ConversationSession<'appointment'>,
          aiIntent,
          message,
        )

      case 'registration':
        return this.registrationFlowService.handle(
          session as ConversationSession<'registration'>,
          aiIntent,
          message,
        )
      default:
        throw new Error(`Flow ${session.currentFlow} not implemented`)
    }
  }

  private startFlowByIntent(
    session: ConversationSession,
    intent: ConversationFlow,
    message: string,
  ) {
    switch (intent) {
      case ConversationFlow.REGISTRATION:
        const registrationSession: ConversationSession<'registration'> = {
          ...session,
          currentFlow: 'registration',
          currentStep: 'START',
          contextData: {
            data: {},
            whatsappNumber: session.whatsappNumber,
          },
        }
        return this.registrationFlowService.handle(
          registrationSession,
          intent,
          message,
        )
      case ConversationFlow.SCHEDULE_APPOINTMENT:
        const appointmentSession: ConversationSession<'appointment'> = {
          ...session,
          currentFlow: 'appointment',
          currentStep: 'START',
          contextData: {
            whatsappNumber: session.contextData?.whatsappNumber || '',
          },
        }
        return this.appointmentFlowService.handle(
          appointmentSession,
          intent,
          message,
        )

      case ConversationFlow.APPOINTMENT_CANCEL:
        session.currentFlow = 'cancel'
        session.currentStep = 'START'
        return 'Vamos cancelar seu agendamento. Qual sessão?'

      default:
        return this.generalFlowService.handle()
    }
  }

  async execute(
    aiIntent: ConversationFlow,
    session: ConversationSession,
    message: string,
    user?: User | null,
  ) {
    if (!user) {
      if (session.currentFlow === 'registration') {
        console.log('Continuing registration flow for unregistered user')
        return this.continueFlow(session, message, aiIntent)
      }

      const registrationSession: ConversationSession<'registration'> = {
        ...session,
        currentFlow: 'registration',
        currentStep: RegistrationFlowSteps.START,
        whatsappNumber: session.contextData?.whatsappNumber || '',
        contextData: {
          data: {},
          whatsappNumber: session.contextData?.whatsappNumber || '',
        },
      }

      return this.registrationFlowService.handle(
        registrationSession,
        aiIntent,
        message,
      )
    }

    if (session.currentFlow) {
      return this.continueFlow(session, message, aiIntent)
    }

    return this.startFlowByIntent(session, aiIntent, message)
  }
}
