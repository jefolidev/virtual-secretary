import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointments.repository'
import { FetchScheduleUseCase } from './fetch-schedules'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: FetchScheduleUseCase

describe('Fetch All Appointments', async () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    sut = new FetchScheduleUseCase(inMemoryAppointmentRepository)
  })

  it('should be able to fetch all appointments', async () => {
    const response = await sut.execute({})

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.appointments).toEqual([])
      expect(response.value.appointments).toHaveLength(0)
    }
  })
})
