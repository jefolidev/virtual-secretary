import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma/prisma.service'
import { PatchSessionBody } from './dto/patch-session.dto'

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateSession(userId: string) {
    let session = await this.prisma.session.findFirst({
      where: { userId, status: 'ACTIVE' },
    })

    if (!session) {
      session = await this.prisma.session.create({
        data: { userId },
      })
    }

    return session
  }

  async getOrCreateSessionByWhatsapp(whatsappNumber: string) {
    let session = await this.prisma.session.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [
          { user: { whatsappNumber } },
          { contextData: { path: ['whatsappNumber'], equals: whatsappNumber } },
        ],
      },
    })

    console.log('session found by whatsapp:', session)

    if (!session) {
      session = await this.prisma.session.create({
        data: {
          currentFlow: null,
          currentStep: null,
          contextData: { whatsappNumber },
          status: 'ACTIVE',
        },
      })
    }

    return session
  }

  async getActiveSessions() {
    return this.prisma.session.findMany({
      where: { status: 'ACTIVE' },
    })
  }

  async getSessionById(sessionId: string) {
    return this.prisma.session.findUnique({
      where: { id: sessionId },
    })
  }

  async getUserIdByWhatsapp(whatsappNumber: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        user: {
          whatsappNumber,
        },
        status: 'ACTIVE',
      },
    })

    return session?.userId || null
  }

  async patchSessionStatus(sessionId: string, data: PatchSessionBody) {
    const session = await this.prisma.session.updateMany({
      where: { id: sessionId },
      data: { status: data.status },
    })

    return session
  }

  async finishSessionsByUserId(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'FINISHED', endedAt: new Date() },
    })
  }

  async expireSession(sessionId: string) {
    return this.prisma.session.updateMany({
      where: { id: sessionId, status: 'ACTIVE' },
      data: { status: 'EXPIRED', endedAt: new Date() },
    })
  }
}
