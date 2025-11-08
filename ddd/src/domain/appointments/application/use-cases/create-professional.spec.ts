import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotificationSettings } from '../../enterprise/entities/value-objects/notification-settings'
import { InMemoryProfessionalRepository } from './../../../../../test/repositories/in-memory-professional.repository'
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
      name: 'John Doe',
      phone: faker.phone.number(),
      officeAddress: faker.location.streetAddress(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { professional } = response.value

      expect(professional.name).toBe('John Doe')
      expect(professional.notificationSettings).toBeInstanceOf(
        NotificationSettings
      )
      expect(professional.notificationSettings).toBeInstanceOf(
        NotificationSettings
      )
      expect(professional.scheduleConfigurationId).toEqual(
        new UniqueEntityId('schedule-configuration-id')
      )
      expect(professional.cancellationPolicyId).toEqual(
        new UniqueEntityId('cancellation-policy-id')
      )
    }
  })
})
