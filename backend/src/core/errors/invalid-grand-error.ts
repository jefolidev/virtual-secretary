export class InvalidGrantError extends Error {
  constructor() {
    super('Google authorization has been revoked or expired')
    this.name = 'InvalidGrantError'
  }
}
