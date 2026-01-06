import { TokenInvalidator } from '@/domain/scheduling/application/cryptography/token-invalidator'
import { Injectable } from '@nestjs/common'

@Injectable()
export class InMemoryTokenInvalidator implements TokenInvalidator {
  private invalidatedTokens = new Set<string>()
  private tokenExpirations = new Map<string, number>()

  async invalidate(token: string): Promise<void> {
    this.invalidatedTokens.add(token)

    // JWT tokens geralmente expiram em 24h, vamos limpar após 25h
    const expirationTime = Date.now() + 25 * 60 * 60 * 1000 // 25 horas
    this.tokenExpirations.set(token, expirationTime)
  }

  async isInvalidated(token: string): Promise<boolean> {
    return this.invalidatedTokens.has(token)
  }

  async cleanup(): Promise<void> {
    const now = Date.now()

    for (const [token, expiration] of this.tokenExpirations.entries()) {
      if (now > expiration) {
        this.invalidatedTokens.delete(token)
        this.tokenExpirations.delete(token)
      }
    }
  }
}
