import { WhatsappContact } from '../../enterprise/entities/whatsapp-contact';

export abstract class WhatsappContactRepository {
  abstract upsertFromWebhook(payload: any): Promise<WhatsappContact | null>
  abstract upsertByPhone(
    phone: string,
    partial: Partial<WhatsappContact>,
  ): Promise<WhatsappContact>
  abstract linkToUser(phone: string, userId: string): Promise<WhatsappContact>
  abstract findByPhone(phone: string): Promise<WhatsappContact | null>
  abstract findByUserId(userId: string): Promise<WhatsappContact | null>
}
