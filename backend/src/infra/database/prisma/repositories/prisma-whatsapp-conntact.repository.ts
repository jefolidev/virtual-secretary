import { WhatsappContactRepository } from '@/domain/scheduling/application/repositories/whatsapp-contact.repository'
import { WhatsappContact } from '@/domain/scheduling/enterprise/entities/whatsapp-contact'
import { Injectable } from '@nestjs/common'
import { PrismaWhatsappContactMapper } from '../../mappers/prisma-whatsapp-contact-mapper'
import { PrismaService } from '../../prisma/prisma.service'

export interface WhatsappWebhookPayload {
  data?: {
    key?: {
      remoteJid?: string
      participant?: string
      [k: string]: any
    }
    pushName?: string
    contacts?: Array<{
      profile?: { name?: string; [k: string]: any }
      wa_id?: string
      displayName?: string
      [k: string]: any
    }>
    message?: {
      timestamp?: number | string
      senderName?: string
      [k: string]: any
    }
    [k: string]: any
  }
  contacts?: Array<{
    profile?: { name?: string }
    wa_id?: string
    displayName?: string
  }>
  from?: string
  [k: string]: any
}

@Injectable()
export class PrismaWhatsappContactRepository extends WhatsappContactRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findByUserId(userId: string): Promise<WhatsappContact | null> {
    const contact = await this.prisma.whatsappContact.findUnique({
      where: { userId },
    })

    if (!contact) return null

    return PrismaWhatsappContactMapper.toDomain(contact)
  }

  async findByPhone(phone: string): Promise<WhatsappContact | null> {
    const contact = await this.prisma.whatsappContact.findUnique({
      where: { phone },
    })
    if (!contact) return null
    return PrismaWhatsappContactMapper.toDomain(contact)
  }

  async upsertFromWebhook(payload: WhatsappWebhookPayload) {
    const data = payload?.data ?? {}
    const key = data.key ?? {}
    const message = data.message ?? {}
    const remoteJid = key.remoteJid ?? key?.participant ?? null
    const phone = remoteJid ? remoteJid.split('@')[0] : null

    if (!phone) return null

    const isRegistred = !!(await this.prisma.user.findUnique({
      where: { whatsappNumber: phone },
    }))

    const nickName =
      data.pushName ??
      data?.contacts?.[0]?.profile?.name ??
      message?.senderName ??
      ''

    const lastSeen =
      message?.timestamp && !isNaN(Number(message.timestamp))
        ? new Date(Number(message.timestamp) * 1000)
        : new Date()

    const createData = {
      phone,
      nickName: nickName || '',
      profilePicUrl: null,
      isOnline: false,
      isRegistred,
      lastSeen,
      metadata: payload ? JSON.parse(JSON.stringify(payload)) : {},
      userId: null,
    }

    const updateData = {
      nickName: nickName || undefined,
      profilePicUrl: undefined,
      isOnline: undefined,
      isRegistred,
      lastSeen,
      metadata: payload ? JSON.parse(JSON.stringify(payload)) : {},
    }

    const contact = await this.prisma.whatsappContact.upsert({
      where: { phone },
      create: createData,
      update: updateData,
    })

    return PrismaWhatsappContactMapper.toDomain(contact)
  }

  async upsertByPhone(phone: string, partial: Partial<WhatsappContact>) {

    const isRegistred = !!(await this.prisma.user.findUnique({
      where: { whatsappNumber: phone },
    }))

    const createData = {
      phone,
      nickName: partial.nickName ?? partial.nickName ?? '',
      profilePicUrl: partial.profilePicUrl ?? null,
      isOnline: !!partial.isOnline,
      isRegistred,
      lastSeen: partial.lastSeen ? new Date(partial.lastSeen) : null,
      metadata: partial.metadata
        ? JSON.parse(JSON.stringify(partial.metadata))
        : {},
    }

    const updateData = {
      nickName: partial.nickName ?? partial.nickName ?? undefined,
      profilePicUrl: partial.profilePicUrl ?? undefined,
      isOnline: partial.isOnline ?? undefined,
      isRegistred,
      lastSeen: partial.lastSeen ? new Date(partial.lastSeen) : undefined,
      metadata: partial.metadata
        ? JSON.parse(JSON.stringify(partial.metadata))
        : undefined,
    }

    const contact = await this.prisma.whatsappContact.upsert({
      where: { phone },
      create: createData,
      update: updateData,
    })

    return PrismaWhatsappContactMapper.toDomain(contact)
  }

  async linkToUser(phone: string, userId: string) {
    const contact = await this.prisma.whatsappContact.upsert({
      where: { phone },
      create: { phone, userId, nickName: '' },
      update: { userId },
    })
    return PrismaWhatsappContactMapper.toDomain(contact)
  }

  private extractFromPayload(payload: WhatsappWebhookPayload) {
    const contact = payload?.contacts?.[0] ?? {}
    const profile = contact.profile ?? {}
    const phone = contact?.wa_id ?? payload?.from ?? null
    return {
      phone,
      nickName: profile?.name ?? contact?.displayName ?? null,
      displayName: contact?.displayName ?? null,
      profilePicUrl: null, // obter via Graph API se necessário
      isOnline: false,
      lastSeen: null,
      metadata: payload,
      userId: null,
    }
  }
}
