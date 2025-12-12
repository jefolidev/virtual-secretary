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
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { professional } = response.value
    }
  })
})
