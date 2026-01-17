export class PhoneAlreadyExistsError extends Error {
  constructor() {
    super('This user whatsappNumber number is already in use.')
  }
}
