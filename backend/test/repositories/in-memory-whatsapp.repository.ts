import { WhatsappRepository } from '@/domain/scheduling/application/repositories/whatsapp.repository';

export class InMemoryWhatsappRepository implements WhatsappRepository {
  public messages: { to: string; message: string }[] = []
  private pendingEvaluations: Map<string, string> = new Map()

  async sendMessage(to: string, message: string): Promise<string> {
    this.messages.push({ to, message })
    return message
  }

  async markPendingEvaluation(
    whatsappNumber: string,
    appointmentId: string,
  ): Promise<void> {
    this.pendingEvaluations.set(whatsappNumber, appointmentId)
  }

  async getPendingEvaluation(whatsappNumber: string): Promise<string | null> {
    return this.pendingEvaluations.get(whatsappNumber) || null
  }

  async clearPendingEvaluation(whatsappNumber: string): Promise<void> {
    this.pendingEvaluations.delete(whatsappNumber)
  }
}
