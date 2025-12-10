import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeAddress } from '@test/factories/make-address'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { User } from '../../enterprise/entities/user'
import { PasswordDoesntMatchesError } from './errors/password-does-not-matches'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { ForgotPasswordUseCase } from './forgot-password'

let inMemoryUserRepository: InMemoryUserRepository
let fakeHasher: FakeHasher
let sut: ForgotPasswordUseCase

describe('Reset password ', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()
    sut = new ForgotPasswordUseCase(inMemoryUserRepository, fakeHasher)
  })

  it('should reset password successfully', async () => {
    const address = makeAddress()

    const user = User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'JohnDoe123',
      addressId: address.id,
      professionalId: undefined,
      clientId: undefined,
      cpf: '07609254371',
      phone: '85987146194',
      role: 'CLIENT',
    })

    await inMemoryUserRepository.create(user)

    const result = await sut.execute({
      email: user.email,
      newPassword: 'newPassword123',
      newPasswordConfirmation: 'newPassword123',
    })

    expect(result.isRight()).toBe(true)
    expect(
      await fakeHasher.compare(
        'newPassword123',
        inMemoryUserRepository.items[0].password
      )
    ).toBe(true)
  })

  it('should return WrongCredentialsError when user not found', async () => {
    const result = await sut.execute({
      email: 'nonexistent@example.com',
      newPassword: 'newpass123',
      newPasswordConfirmation: 'newpass123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should return PasswordDoesntMatchesError when passwords do not match', async () => {
    const address = makeAddress()

    const user = User.create({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'JohnDoe123',
      addressId: address.id,
      professionalId: undefined,
      clientId: undefined,
      cpf: '07609254371',
      phone: '85987146194',
      role: 'CLIENT',
    })

    await inMemoryUserRepository.create(user)

    const result = await sut.execute({
      email: 'test@example.com',
      newPassword: 'newpass123',
      newPasswordConfirmation: 'differentpass',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(PasswordDoesntMatchesError)
  })

  it('should hash the new password before saving', async () => {
    const address = makeAddress()

    const user = User.create({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'JohnDoe123',
      addressId: address.id,
      professionalId: undefined,
      clientId: undefined,
      cpf: '07609254371',
      phone: '85987146194',
      role: 'CLIENT',
    })

    await inMemoryUserRepository.create(user)

    const result = await sut.execute({
      email: 'test@example.com',
      newPassword: 'newpass123',
      newPasswordConfirmation: 'newpass123',
    })

    expect(result.isRight()).toBe(true)
    expect(
      await fakeHasher.compare(
        'newpass123',
        inMemoryUserRepository.items[0].password
      )
    ).toBe(true)
  })
})
