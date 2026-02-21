import { WhatsappRepository } from '@/domain/scheduling/application/repositories/whatsapp.repository';
import { vi } from 'vitest';

export class InMemoryWhatsappRepository implements WhatsappRepository {
  private messages: { to: string; message: string }[] = []
  private pendingEvaluations: Map<string, string> = new Map()

  // make sendMessage a mockable function so tests can assert calls
  sendMessage = vi.fn(async (to: string, message: string) => {
    this.messages.push({ to, message })
    return message
  })

  async markPendingEvaluation(
    whatsappNumber: string,
    appointmentId: string,
    ttlDays = 7,
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
