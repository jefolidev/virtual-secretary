import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryCancellationPolicyRepository } from '../../../../../test/repositories/in-memory-cancellation-policy.repository'
import { CreateCancellationPolicyUseCase } from './create-cancellation-policy'
import { ValidationError } from './errors/validation-error'

let inMemoryCancellationPolicyRepository: InMemoryCancellationPolicyRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: CreateCancellationPolicyUseCase

describe('Create Cancellation Policy', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryCancellationPolicyRepository =
      new InMemoryCancellationPolicyRepository()
    sut = new CreateCancellationPolicyUseCase(
      inMemoryCancellationPolicyRepository,
      inMemoryProfessionalRepository
    )
  })

  it('should be able to create a cancellation policy', async () => {
    const professional = makeProfessional()

    inMemoryProfessionalRepository.create(professional)

    const professionalId = professional.id.toString()

    const cancellationPolicy = {
      id: new UniqueEntityId('id').toString(),
      allowReschedule: true,
      cancelationFeePercentage: 0.5,
      minHoursBeforeCancellation: 3,
      description: 'Cancellation Policy',
      professionalId,
      minDaysBeforeNextAppointment: 1,
    }

    const cancellationPolicyId = cancellationPolicy.id.toString()

    inMemoryProfessionalRepository.assignCancellationPolicy(
      professionalId,
      cancellationPolicyId
    )

    const response = await sut.execute(cancellationPolicy)

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { cancellationPolicy } = response.value

      expect(cancellationPolicy.cancelationFeePercentage).toBe(0.5)
      expect(cancellationPolicy.minHoursBeforeCancellation).toBe(3)
      expect(cancellationPolicy.description).toBe('Cancellation Policy')
      expect(
        cancellationPolicy.professionalId.equals(
          new UniqueEntityId(professionalId)
        )
      ).toBe(true)
    }
  })

  it('should be not able to create a cancellation policy if the min hours is less than three', async () => {
    const professional = makeProfessional()

    inMemoryProfessionalRepository.create(professional)

    const professionalId = professional.id.toString()

    const cancellationPolicy = {
      id: new UniqueEntityId('id').toString(),
      allowReschedule: true,
      cancelationFeePercentage: 0.5,
      minHoursBeforeCancellation: 1,
      description: 'Cancellation Policy',
      minDaysBeforeNextAppointment: 1,
      professionalId,
    }

    const cancellationPolicyId = cancellationPolicy.id.toString()

    inMemoryProfessionalRepository.assignCancellationPolicy(
      professionalId,
      cancellationPolicyId
    )

    const response = await sut.execute(cancellationPolicy)

    expect(response.isLeft()).toBe(true)
    expect(response.value).instanceOf(ValidationError)
  })
})
