import { InMemoryGoogleCalendarTokenRepository } from '@test/repositories/in-memory-google-calendar-token.repository'
import { HandleOAuthCallbackUseCase } from './handle-oauth-callback'

let inMemoryGoogleCalendarTokenRepository: InMemoryGoogleCalendarTokenRepository
let sut: HandleOAuthCallbackUseCase

describe('Handle OAuth Callback', () => {
  beforeEach(() => {
    inMemoryGoogleCalendarTokenRepository =
      new InMemoryGoogleCalendarTokenRepository()

    sut = new HandleOAuthCallbackUseCase(inMemoryGoogleCalendarTokenRepository)
  })

  it('should be able to save tokens from oauth callback code', async () => {
    const professionalId = 'professional-123'
    const code = 'oauth-code-abc123'

    const response = await sut.execute({
      code,
      professionalId,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.message).toBe('Tokens saved successfully')
      expect(
        inMemoryGoogleCalendarTokenRepository.tokens.has(professionalId),
      ).toBe(true)

      const savedToken =
        inMemoryGoogleCalendarTokenRepository.tokens.get(professionalId)
      expect(savedToken?.code).toBe(code)
      expect(savedToken?.email).toBe(`professional-${professionalId}@gmail.com`)
    }
  })

  it('should save email associated with google account', async () => {
    const professionalId = 'professional-456'
    const code = 'oauth-code-xyz789'

    const response = await sut.execute({
      code,
      professionalId,
    })

    expect(response.isRight()).toBe(true)

    const savedToken =
      inMemoryGoogleCalendarTokenRepository.tokens.get(professionalId)
    expect(savedToken?.email).toContain('@gmail.com')
  })

  it('should be able to save tokens for multiple professionals', async () => {
    await sut.execute({
      code: 'code-1',
      professionalId: 'professional-1',
    })

    await sut.execute({
      code: 'code-2',
      professionalId: 'professional-2',
    })

    expect(inMemoryGoogleCalendarTokenRepository.tokens.size).toBe(2)
    expect(
      inMemoryGoogleCalendarTokenRepository.tokens.has('professional-1'),
    ).toBe(true)
    expect(
      inMemoryGoogleCalendarTokenRepository.tokens.has('professional-2'),
    ).toBe(true)
  })
})
