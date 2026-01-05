export class PhoneAlreadyExistsError extends Error {
  constructor() {
    super('This user phone number is already in use.')
  }
}
