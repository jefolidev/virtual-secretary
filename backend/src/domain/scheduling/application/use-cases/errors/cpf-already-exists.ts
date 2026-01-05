export class CpfAlreadyExists extends Error {
  constructor() {
    super('Já existe um usuário cadastrado com este CPF.')
  }
}
