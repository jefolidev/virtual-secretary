import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { FetchProfessionalWithNotificationSettingsUseCase } from './fetch-professional-notification-settings'

let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: FetchProfessionalWithNotificationSettingsUseCase

describe('Fetch A Professional With Notification Settings', async () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    sut = new FetchProfessionalWithNotificationSettingsUseCase(
      inMemoryProfessionalRepository
    )
  })

  it('should be able to fetch all professionals', async () => {
    const professional = makeProfessional()

    await inMemoryProfessionalRepository.create(professional)

    const response = await sut.execute({
      professionalId: professional.id.toString(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.professional?.professionalId).toEqual(
        professional.id
      )
      expect(response.value.professional?.notificationSettings).toEqual(
        professional.notificationSettings
      )
    }
  })
})
