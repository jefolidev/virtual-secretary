import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { ConversationSession, FlowContextMap } from '.'

export class FlowServiceUtil<T extends keyof FlowContextMap> {
  protected readonly prisma: PrismaService
  constructor(prisma: PrismaService) {
    this.prisma = prisma
  }
  async updateSession(session: ConversationSession<T>) {
    if (!session) {
      throw new Error('Session contextData is undefined')
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        currentStep: session.currentStep,
        currentFlow: session.currentFlow,
        contextData: session.contextData as object,
        lastInteractionAt: new Date(),
      },
    })
  }

  async finishSession(session: ConversationSession<T>) {
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        currentStep: null,
        currentFlow: null,
        contextData: {},
        lastInteractionAt: new Date(),
        status: 'FINISHED',
      },
    })
  }
}
