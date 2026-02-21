export abstract class WhatsappRepository {
  abstract sendMessage(to: string, message: string): Promise<string>
}
