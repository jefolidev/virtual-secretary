export abstract class WhatsappRepository {
  abstract sendMessage(to: string, message: string): Promise<string>
  abstract markPendingEvaluation(
    whatsappNumber: string,
    appointmentId: string,
  ): Promise<void>
  abstract getPendingEvaluation(whatsappNumber: string): Promise<string | null>
  abstract clearPendingEvaluation(whatsappNumber: string): Promise<void>
}
