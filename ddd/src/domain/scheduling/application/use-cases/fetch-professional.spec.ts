import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { FetchProfessionalUseCase } from './fetch-professional'

let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: FetchProfessionalUseCase

describe('Fetch All Professionals', async () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    sut = new FetchProfessionalUseCase(inMemoryProfessionalRepository)
  })

  it('should be able to fetch all professionals', async () => {
    const response = await sut.execute({})

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.professionals).toEqual([])
      expect(response.value.professionals).toHaveLength(0)
    }
  })
})
