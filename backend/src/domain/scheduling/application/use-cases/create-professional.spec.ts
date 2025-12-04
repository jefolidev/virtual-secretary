import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { faker } from '@faker-js/faker'
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
      name: 'John Doe',
      phone: faker.phone.number(),
      sessionPrice: 0,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { professional } = response.value

      expect(professional.name).toBe('John Doe')
      expect(professional.scheduleConfigurationId).toEqual(
        new UniqueEntityId('schedule-configuration-id')
      )
      expect(professional.cancellationPolicyId).toEqual(
        new UniqueEntityId('cancellation-policy-id')
      )
    }
  })
})
