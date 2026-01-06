export abstract class TokenInvalidator {
  abstract invalidate(token: string): Promise<void>
  abstract isInvalidated(token: string): Promise<boolean>
  abstract cleanup(): Promise<void>
}
