import { makeAppointment } from 'test/factories/make-appointment'
import { makeClient } from 'test/factories/make-client'
import { makeProfessional } from 'test/factories/make-professional'
import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointments.repository'
import { InMemoryClientRepository } from 'test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from 'test/repositories/in-memory-professional.repository'
import { CreateAppointmentUseCase } from './create-schedule'
import { NoDisponibilityError } from './errors/no-disponibility-error'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository

let sut: CreateAppointmentUseCase

describe('Create Appointment', () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    sut = new CreateAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryClientRepository,
      inMemoryProfessionalRepository
    )
  })

  it('should be able to create an appointment', async () => {
    const client = makeClient()
    const professional = makeProfessional()

    await inMemoryClientRepository.create(client)
    await inMemoryProfessionalRepository.create(professional)

    const response = await sut.execute({
      clientId: client.id,
      professionalId: professional.id,
      startDateTime: new Date(),
      endDateTime: new Date(),
      modality: 'ONLINE',
      googleMeetLink: 'https://meet.google.com/abc',
      price: 100,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { appointment } = response.value
      const inMemoryAppointment = inMemoryAppointmentRepository.items[0]

      expect(inMemoryAppointment).toEqual(appointment)
      expect(inMemoryAppointment?.googleMeetLink).toContain('abc')
      expect(inMemoryAppointment?.status).toBe('SCHEDULED')
    }
  })

  it('should not be able to create an appointment with overlapping schedule', async () => {
    const client = makeClient()
    const professional = makeProfessional()
    const appointment = makeAppointment({
      professionalId: professional.id,
      startDateTime: new Date('2023-01-01T10:00:00.000Z'),
      endDateTime: new Date('2023-01-01T11:00:00.000Z'),
    })

    await inMemoryClientRepository.create(client)
    await inMemoryProfessionalRepository.create(professional)
    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      clientId: client.id,
      professionalId: professional.id,
      startDateTime: new Date('2023-01-01T10:00:00.000Z'),
      endDateTime: new Date('2023-01-01T11:00:00.000Z'),
      modality: 'ONLINE',
      googleMeetLink: 'https://meet.google.com/abc',
      price: 100,
    })

    const overlappingAppointments =
      await inMemoryAppointmentRepository.findOverlapping(
        professional.id,
        new Date('2023-01-01T10:00:00.000Z'),
        new Date('2023-01-01T11:00:00.000Z')
      )

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NoDisponibilityError)

    expect(inMemoryAppointmentRepository.items).toHaveLength(1)

    expect(overlappingAppointments).toHaveLength(1)
    expect(overlappingAppointments[0]).toEqual(appointment)
  })
})
