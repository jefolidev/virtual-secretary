import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { FetchScheduleByProfessionalIdUseCase } from './fetch-schedule-by-professional-id'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: FetchScheduleByProfessionalIdUseCase

describe('Fetch Appointments by Professional', async () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    sut = new FetchScheduleByProfessionalIdUseCase(
      inMemoryAppointmentRepository,
    )
  })

  it('should be able to fetch all appointments', async () => {
    const professional = makeProfessional(
      {},
      new UniqueEntityId('any-professional-id'),
    )

    const appointment = makeAppointment({
      professionalId: new UniqueEntityId('any-professional-id'),
    })

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      professionalId: 'any-professional-id',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.appointments[0]).toEqual(appointment)
      expect(response.value.appointments).toHaveLength(1)
    }
  })
})
