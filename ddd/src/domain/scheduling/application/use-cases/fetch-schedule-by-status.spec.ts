import { makeAppointment } from '@test/factories/make-appointment'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { FetchScheduleByStatusUseCase } from './fetch-schedule-by-status'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: FetchScheduleByStatusUseCase

describe('Fetch Appointments by Status', async () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    sut = new FetchScheduleByStatusUseCase(inMemoryAppointmentRepository)
  })

  it('should be able to fetch all appointments', async () => {
    const appointment = makeAppointment({
      status: 'SCHEDULED',
    })

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      status: 'SCHEDULED',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.appointments).toHaveLength(1)
      expect(response.value.appointments[0]?.status).toBe('SCHEDULED')
    }
  })
})
