import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeAddress } from '@test/factories/make-address'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { RegisterUserUseCase } from './register-user'

let inMemoryUsersRepository: InMemoryUserRepository
let fakeHasher: FakeHasher

let sut: RegisterUserUseCase

describe('Register User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()

    sut = new RegisterUserUseCase(inMemoryUsersRepository, fakeHasher)
  })

  it('should be able to register a new user as client', async () => {
    const address = makeAddress()
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      address,
      cpf: '07609254371',
      phone: '85987146194',
      role: 'CLIENT',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      user: inMemoryUsersRepository.items[0],
    })
    expect(inMemoryUsersRepository.items[0].role).toBe('CLIENT')
    expect(inMemoryUsersRepository.items[0].clientId).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].professionalId).toBeUndefined()
  })

  it('should be able to register a new user as professional', async () => {
    const address = makeAddress()

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      address,
      cpf: '07609254371',
      phone: '85987146194',
      role: 'PROFESSIONAL',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      user: inMemoryUsersRepository.items[0],
    })
    expect(inMemoryUsersRepository.items[0].role).toBe('PROFESSIONAL')
    expect(inMemoryUsersRepository.items[0].clientId).toBeUndefined()
    expect(inMemoryUsersRepository.items[0].professionalId).toBeTruthy()
  })

  it('should hash user password upon registration', async () => {
    const address = makeAddress()

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      cpf: '07609254371',
      phone: '85987146194',
      role: 'PROFESSIONAL',
      address,
    })

    const hashedPassword = await fakeHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(inMemoryUsersRepository.items[0].password).toEqual(hashedPassword)
  })
})
