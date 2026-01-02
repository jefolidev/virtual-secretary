import { InMemoryProfessionalRepository } from '../../../../../test/repositories/in-memory-professional.repository'
import { CreateProfessionalUseCase } from './create-professional'

let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: CreateProfessionalUseCase

describe('Create Professional', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    sut = new CreateProfessionalUseCase(inMemoryProfessionalRepository)
  })

  it('should be able to create a professional', async () => {
    const response = await sut.execute({
      sessionPrice: 0,
      channels: ['EMAIL', 'WHATSAPP'],
      dailySummaryTime: '18:00',
      enabledTypes: [
        'CANCELLATION',
        'CONFIRMED_LIST',
        'CONFIRMATION',
        'DAILY_SUMMARY',
      ],
      reminderBeforeMinutes: 50,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { professional } = response.value

      expect(professional.sessionPrice).toBe(0)
      expect(professional.notificationSettings).toBeTruthy()
      expect(professional.notificationSettings?.channels).toContain('EMAIL')
      expect(professional.notificationSettings?.channels).toContain('WHATSAPP')
      expect(professional.notificationSettings?.dailySummaryTime).toBe('18:00')
      expect(professional.notificationSettings?.enabledTypes).toContain(
        'CANCELLATION'
      )
      expect(professional.notificationSettings?.enabledTypes).toContain(
        'CONFIRMED_LIST'
      )
      expect(professional.notificationSettings?.enabledTypes).toContain(
        'CONFIRMATION'
      )
      expect(professional.notificationSettings?.enabledTypes).toContain(
        'DAILY_SUMMARY'
      )
      expect(professional.notificationSettings?.reminderBeforeMinutes).toBe(50)
      expect(professional.cancellationPolicyId).toBeTruthy()
      expect(professional.scheduleConfigurationId).toBeTruthy()
    }
  })
})
