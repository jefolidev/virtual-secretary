import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { FakeTokenInvalidator } from '@test/cryptography/fake-token-invalidator'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { User } from '../../enterprise/entities/user'
import { LogoutUseCase } from './logout'

let fakeTokenInvalidator: FakeTokenInvalidator
let inMemoryUserRepository: InMemoryUserRepository
let sut: LogoutUseCase

describe('LogoutUseCase', () => {
  beforeEach(() => {
    fakeTokenInvalidator = new FakeTokenInvalidator()
    inMemoryUserRepository = new InMemoryUserRepository()
    sut = new LogoutUseCase(fakeTokenInvalidator, inMemoryUserRepository)
  })

  it('should be able to logout a user successfully', async () => {
    const token = 'valid-jwt-token'
    const userId = new UniqueEntityId('user-123')

    const user = User.create(
      {
        name: 'Test User',
        email: 'test@example.com',
        birthDate: new Date('1990-01-01'),
        cpf: '12345678900',
        gender: 'MALE',
        whatsappNumber: '1234567890',
        password: 'password',
        role: 'CLIENT',
      },
      userId,
    )

    await inMemoryUserRepository.create(user)

    const result = await sut.execute({
      userId: userId.toString(),
      token,
      cookieOptions: {
        request: {},
        response: {
          clearCookie: vi.fn(),
        },
      },
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      success: true,
    })
  })

  it('should invalidate the token when user logs out', async () => {
    const token = 'valid-jwt-token'
    const userId = new UniqueEntityId('user-123')

    const user = User.create(
      {
        name: 'Test User',
        email: 'test@example.com',
        birthDate: new Date('1990-01-01'),
        cpf: '12345678900',
        gender: 'MALE',
        whatsappNumber: '1234567890',
        password: 'password',
        role: 'CLIENT',
      },
      userId,
    )

    await inMemoryUserRepository.create(user)

    await sut.execute({
      userId: userId.toString(),
      token,
      cookieOptions: {
        request: {},
        response: {
          clearCookie: vi.fn(),
        },
      },
    })

    expect(await fakeTokenInvalidator.isInvalidated(token)).toBe(true)
  })

  it('should add token to invalidated tokens list', async () => {
    const token = 'another-valid-token'
    const userId = new UniqueEntityId('user-456')

    const user = User.create(
      {
        name: 'Test User',
        email: 'test@example.com',
        birthDate: new Date('1990-01-01'),
        cpf: '12345678900',
        gender: 'MALE',
        whatsappNumber: '1234567890',
        password: 'password',
        role: 'CLIENT',
      },
      userId,
    )

    await inMemoryUserRepository.create(user)

    // Lista deve estar vazia inicialmente
    console.log(fakeTokenInvalidator.getInvalidatedTokens())

    expect(fakeTokenInvalidator.getInvalidatedTokens()).toHaveLength(0)

    await sut.execute({
      userId: userId.toString(),
      token,
      cookieOptions: {
        request: {},
        response: {
          clearCookie: vi.fn(),
        },
      },
    })

    // Token deve estar na lista de tokens invalidados
    expect(fakeTokenInvalidator.getInvalidatedTokens()).toContain(token)
    expect(fakeTokenInvalidator.getInvalidatedTokens()).toHaveLength(1)
  })

  it('should handle multiple logout operations', async () => {
    const token1 = 'token-1'
    const token2 = 'token-2'
    const userId = new UniqueEntityId('user-789')

    const cookieOptions = {
      request: {},
      response: {
        clearCookie: vi.fn(),
      },
    }

    const user = User.create(
      {
        name: 'Test User',
        email: 'test@example.com',
        birthDate: new Date('1990-01-01'),
        cpf: '12345678900',
        gender: 'MALE',
        whatsappNumber: '1234567890',
        password: 'password',
        role: 'CLIENT',
      },
      userId,
    )

    await inMemoryUserRepository.create(user)

    await sut.execute({
      userId: userId.toString(),
      token: token1,
      cookieOptions,
    })
    await sut.execute({
      userId: userId.toString(),
      token: token2,
      cookieOptions,
    })

    expect(await fakeTokenInvalidator.isInvalidated(token1)).toBe(true)
    expect(await fakeTokenInvalidator.isInvalidated(token2)).toBe(true)
    expect(fakeTokenInvalidator.getInvalidatedTokens()).toHaveLength(2)
  })
})
