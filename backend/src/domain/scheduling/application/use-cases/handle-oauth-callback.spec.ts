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
      expect(response.value.googleAccountEmail).toContain('@gmail.com')
      expect(inMemoryGoogleCalendarTokenRepository.items).toHaveLength(1)
      expect(
        inMemoryGoogleCalendarTokenRepository.items[0].professionalId,
      ).toBe(professionalId)
      expect(
        inMemoryGoogleCalendarTokenRepository.items[0].accessToken,
      ).toContain(code)
    }
  })

  it('should save access token and refresh token', async () => {
    const professionalId = 'professional-456'
    const code = 'oauth-code-xyz789'

    const response = await sut.execute({
      code,
      professionalId,
    })

    expect(response.isRight()).toBe(true)

    const savedToken = inMemoryGoogleCalendarTokenRepository.items[0]
    expect(savedToken.accessToken).toBeTruthy()
    expect(savedToken.refreshToken).toBeTruthy()
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

    expect(inMemoryGoogleCalendarTokenRepository.items).toHaveLength(2)
    expect(inMemoryGoogleCalendarTokenRepository.items[0].professionalId).toBe(
      'professional-1',
    )
    expect(inMemoryGoogleCalendarTokenRepository.items[1].professionalId).toBe(
      'professional-2',
    )
  })
})
