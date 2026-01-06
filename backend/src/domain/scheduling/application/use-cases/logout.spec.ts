import { FakeTokenInvalidator } from '@test/cryptography/fake-token-invalidator'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LogoutUseCase } from './logout'

let fakeTokenInvalidator: FakeTokenInvalidator
let sut: LogoutUseCase

describe('Logout User', () => {
  beforeEach(() => {
    fakeTokenInvalidator = new FakeTokenInvalidator()
    sut = new LogoutUseCase(fakeTokenInvalidator)
  })

  it('should be able to logout a user successfully', async () => {
    const token = 'valid-jwt-token'
    const userId = 'user-123'

    const result = await sut.execute({
      userId,
      token,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      success: true,
    })
  })

  it('should invalidate the token when user logs out', async () => {
    const token = 'valid-jwt-token'
    const userId = 'user-123'

    // Verificar que o token não está invalidado inicialmente
    expect(await fakeTokenInvalidator.isInvalidated(token)).toBe(false)

    await sut.execute({
      userId,
      token,
    })

    // Verificar que o token foi invalidado após logout
    expect(await fakeTokenInvalidator.isInvalidated(token)).toBe(true)
  })

  it('should add token to invalidated tokens list', async () => {
    const token = 'another-valid-token'
    const userId = 'user-456'

    // Lista deve estar vazia inicialmente
    expect(fakeTokenInvalidator.getInvalidatedTokens()).toHaveLength(0)

    await sut.execute({
      userId,
      token,
    })

    // Token deve estar na lista de tokens invalidados
    expect(fakeTokenInvalidator.getInvalidatedTokens()).toContain(token)
    expect(fakeTokenInvalidator.getInvalidatedTokens()).toHaveLength(1)
  })

  it('should handle multiple logout operations', async () => {
    const token1 = 'token-1'
    const token2 = 'token-2'
    const userId = 'user-789'

    await sut.execute({ userId, token: token1 })
    await sut.execute({ userId, token: token2 })

    expect(await fakeTokenInvalidator.isInvalidated(token1)).toBe(true)
    expect(await fakeTokenInvalidator.isInvalidated(token2)).toBe(true)
    expect(fakeTokenInvalidator.getInvalidatedTokens()).toHaveLength(2)
  })

  it('should call cleanup automatically during logout', async () => {
    const cleanupSpy = vi.spyOn(fakeTokenInvalidator, 'cleanup')

    await sut.execute({
      userId: 'user-123',
      token: 'some-token',
    })

    expect(cleanupSpy).toHaveBeenCalledTimes(1)
  })
})
