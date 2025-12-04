import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { FetchScheduleByClientIdUseCase } from './fetch-schedule-by-client-id'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: FetchScheduleByClientIdUseCase

describe('Fetch Appointments by Client', async () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    sut = new FetchScheduleByClientIdUseCase(inMemoryAppointmentRepository)
  })

  it('should be able to fetch all appointments', async () => {
    const client = makeAppointment({
      clientId: new UniqueEntityId('any-client-id'),
    })

    await inMemoryAppointmentRepository.create(client)

    const response = await sut.execute({
      clientId: 'any-client-id',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.appointments[0]).toEqual(client)
      expect(response.value.appointments).toHaveLength(1)
    }
  })
})
