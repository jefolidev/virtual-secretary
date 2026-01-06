import { TokenInvalidator } from '@/domain/scheduling/application/cryptography/token-invalidator'

export class FakeTokenInvalidator implements TokenInvalidator {
  private invalidatedTokens = new Set<string>()

  async invalidate(token: string): Promise<void> {
    this.invalidatedTokens.add(token)
  }

  async isInvalidated(token: string): Promise<boolean> {
    return this.invalidatedTokens.has(token)
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for test
  }

  // Helper method for tests
  getInvalidatedTokens(): string[] {
    return Array.from(this.invalidatedTokens)
  }
}
