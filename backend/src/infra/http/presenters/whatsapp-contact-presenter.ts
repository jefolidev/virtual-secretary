import { WhatsappContact } from '@/domain/scheduling/enterprise/entities/whatsapp-contact'

export class WhatsappContactPresenter {
  static toHTTP(whatsappContact: WhatsappContact) {
    return {
      id: whatsappContact.id,
      userId: whatsappContact.userId,
      nickname: whatsappContact.nickName,
      profilePicUrl: whatsappContact.profilePicUrl,
      whatsappNumber: whatsappContact.phone,
      isRegistred: whatsappContact.isRegistred,
      isOnline: whatsappContact.isOnline,
      lastSeen: whatsappContact.lastSeen,
      metadata: whatsappContact.metadata,
      createdAt: whatsappContact.createdAt,
      updatedAt: whatsappContact.updatedAt,
    }
  }
}
