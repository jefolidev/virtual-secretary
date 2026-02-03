import { InMemoryGoogleCalendarTokenRepository } from '@test/repositories/in-memory-google-calendar-token.repository'
import { GetAuthUrlUseCase } from './get-google-auth-url'

let inMemoryGoogleCalendarTokenRepository: InMemoryGoogleCalendarTokenRepository
let sut: GetAuthUrlUseCase

describe('Get Google Auth URL', () => {
  beforeEach(() => {
    inMemoryGoogleCalendarTokenRepository =
      new InMemoryGoogleCalendarTokenRepository()

    // Mock GoogleCalendarService
    const mockGoogleCalendarService = {
      getAuthUrl: (professionalId: string) =>
        Promise.resolve(
          inMemoryGoogleCalendarTokenRepository.getAuthUrl(professionalId),
        ),
    } as any

    sut = new GetAuthUrlUseCase(mockGoogleCalendarService)
  })

  it('should be able to get google auth url with professional id', async () => {
    const professionalId = 'professional-123'

    const response = await sut.execute({ professionalId })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.authUrl).toContain('accounts.google.com')
      expect(response.value.authUrl).toContain(`state=${professionalId}`)
    }
  })

  it('should generate different urls for different professionals', async () => {
    const professional1 = 'professional-1'
    const professional2 = 'professional-2'

    const response1 = await sut.execute({ professionalId: professional1 })
    const response2 = await sut.execute({ professionalId: professional2 })

    expect(response1.isRight()).toBe(true)
    expect(response2.isRight()).toBe(true)

    if (response1.isRight() && response2.isRight()) {
      expect(response1.value.authUrl).not.toBe(response2.value.authUrl)
      expect(response1.value.authUrl).toContain(professional1)
      expect(response2.value.authUrl).toContain(professional2)
    }
  })
})
