export class GoogleNotConnectedError extends Error {
  constructor() {
    super('Google Calendar is not connected or authorization has expired')
    this.name = 'GoogleNotConnectedError'
  }
}
