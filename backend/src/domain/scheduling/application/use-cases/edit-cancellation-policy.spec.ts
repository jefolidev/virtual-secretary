import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { faker } from '@faker-js/faker'
import { makeCancellationPolicy } from '@test/factories/make-cancellation-policy'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryCancellationPolicyRepository } from '@test/repositories/in-memory-cancellation-policy.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { EditCancellationPolicyUseCase } from './edit-cancellation-policy'

let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryCancellationPolicyRepository: InMemoryCancellationPolicyRepository
let sut: EditCancellationPolicyUseCase

describe('Edit Schedule Configuration', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryCancellationPolicyRepository =
      new InMemoryCancellationPolicyRepository()
    sut = new EditCancellationPolicyUseCase(
      inMemoryProfessionalRepository,
      inMemoryCancellationPolicyRepository
    )
  })

  it('should be able to edit a professional schedule configuration', async () => {
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    inMemoryProfessionalRepository.create(professional)

    const cancellationPolicy = makeCancellationPolicy(
      {
        professionalId: professional.id,
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    inMemoryCancellationPolicyRepository.create(cancellationPolicy)

    professional.cancellationPolicyId = cancellationPolicy.id

    inMemoryProfessionalRepository.save(professional)

    const response = await sut.execute({
      allowReschedule: false,
      cancelationFeePercentage: 0.7,
      description: faker.lorem.text(),
      minDaysBeforeNextAppointment: 2,
      minHoursBeforeCancellation: 5,
      professionalId: professional.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(
        inMemoryCancellationPolicyRepository.items[0]?.allowReschedule
      ).toBe(false)
      expect(
        inMemoryCancellationPolicyRepository.items[0]?.cancelationFeePercentage
      ).toBe(0.7)
      expect(
        inMemoryCancellationPolicyRepository.items[0]
          ?.minDaysBeforeNextAppointment
      ).toBe(2)
      expect(
        inMemoryCancellationPolicyRepository.items[0]
          ?.minHoursBeforeCancellation
      ).toBe(5)
    }
  })
})
