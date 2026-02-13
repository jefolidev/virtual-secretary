import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { WhatsappContact } from '@/domain/scheduling/enterprise/entities/whatsapp-contact'
import { WhatsappContact as PrismaWhatsappContact } from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/client'

export class PrismaWhatsappContactMapper {
  static toDomain(raw: PrismaWhatsappContact): WhatsappContact {
    return WhatsappContact.create(
      {
        phone: raw.phone,
        nickName: raw.nickName,
        profilePicUrl: raw.profilePicUrl,
        isOnline: raw.isOnline,
        lastSeen: raw.lastSeen,
        metadata: typeof raw.metadata === 'string' ? JSON.parse(raw.metadata) : null,
        isRegistred: raw.isRegistred,
        userId: raw.userId ? raw.userId : null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id ? new UniqueEntityId(raw.id) : undefined,
    )
  }
}
