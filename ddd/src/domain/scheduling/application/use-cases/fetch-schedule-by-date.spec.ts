/** biome-ignore-all lint/suspicious/noExplicitAny: false */
import { makeAppointment } from '@test/factories/make-appointment'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { ValidationError } from './errors/validation-error'
import { FetchScheduleByDateUseCase } from './fetch-schedule-by-date'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: FetchScheduleByDateUseCase

describe('Fetch Schedule By Date', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    sut = new FetchScheduleByDateUseCase(inMemoryAppointmentRepository)
  })

  it('should be able to fetch schedule by date', async () => {
    const appointment = makeAppointment({
      startDateTime: new Date('2025-01-01T10:00:00.000Z'),
      endDateTime: new Date('2025-01-01T11:00:00.000Z'),
    })

    const olderAppointment = makeAppointment({
      startDateTime: new Date('2023-01-01T10:00:00.000Z'),
      endDateTime: new Date('2023-01-01T11:00:00.000Z'),
    })

    await inMemoryAppointmentRepository.create(appointment)
    await inMemoryAppointmentRepository.create(olderAppointment)

    const response = await sut.execute({
      startDate: new Date('2025-01-01T10:00:00.000Z'),
      endDate: new Date('2025-01-02T11:00:00.000Z'),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.appointments).toHaveLength(1)
      expect(response.value.appointments![0]).toBe(appointment)
    }
  })

  it('should return empty when no appointments are found', async () => {
    const response = await sut.execute({
      startDate: new Date('2030-01-01T00:00:00.000Z'),
      endDate: new Date('2030-01-02T00:00:00.000Z'),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.appointments).toHaveLength(0)
    }
  })
  it('should return ValidationError if dates are not provided', async () => {
    const response = await sut.execute({
      startDate: undefined as any,
      endDate: undefined as any,
    })

    expect(response.isLeft()).toBe(true)
    if (response.isRight()) {
      expect(response.value).toBeInstanceOf(ValidationError)
    }
  })
  it('should include appointments exactly at the start and end boundaries', async () => {
    const boundaryStart = makeAppointment({
      startDateTime: new Date('2025-01-01T10:00:00.000Z'),
      endDateTime: new Date('2025-01-01T11:00:00.000Z'),
    })

    const boundaryEnd = makeAppointment({
      startDateTime: new Date('2025-01-02T10:00:00.000Z'),
      endDateTime: new Date('2025-01-02T11:00:00.000Z'),
    })

    await inMemoryAppointmentRepository.create(boundaryStart)
    await inMemoryAppointmentRepository.create(boundaryEnd)

    const response = await sut.execute({
      startDate: new Date('2025-01-01T10:00:00.000Z'),
      endDate: new Date('2025-01-02T11:00:00.000Z'),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.appointments).toContain(boundaryStart)
      expect(response.value.appointments).toContain(boundaryEnd)
    }
  })
  it('should return ValidationError if startDate is after endDate', async () => {
    const response = await sut.execute({
      startDate: new Date('2025-01-05T10:00:00.000Z'),
      endDate: new Date('2025-01-01T11:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ValidationError)
  })
})
