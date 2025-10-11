import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { makeScheduleConfiguration } from '@test/factories/make-schedule-configuration'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import { CreateAppointmentUseCase } from './create-schedule'
import { NoDisponibilityError } from './errors/no-disponibility-error'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository

let sut: CreateAppointmentUseCase

describe('Create Appointment', () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryScheduleConfigurationRepository =
      new InMemoryScheduleConfigurationRepository()
    sut = new CreateAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryClientRepository,
      inMemoryProfessionalRepository,
      inMemoryScheduleConfigurationRepository
    )
  })

  it('should be able to create an appointment', async () => {
    const client = makeClient()
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )
    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    await inMemoryClientRepository.create(client)
    await inMemoryProfessionalRepository.create(professional)
    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = new UniqueEntityId(
      'schedule-configuration-id'
    )

    await inMemoryProfessionalRepository.save(professional)

    const response = await sut.execute({
      clientId: client.id,
      professionalId: professional.id,
      startDateTime: new Date('11/10/2025 10:00'),
      endDateTime: new Date('11/10/2025 11:00'),
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
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )
    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    await inMemoryClientRepository.create(client)
    await inMemoryProfessionalRepository.create(professional)
    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = new UniqueEntityId(
      'schedule-configuration-id'
    )

    await inMemoryProfessionalRepository.save(professional)

    const appointment = makeAppointment({
      professionalId: professional.id,
      startDateTime: new Date('2023-01-01T10:00:00.000Z'),
      endDateTime: new Date('2023-01-01T11:01:00.000Z'),
    })

    await inMemoryClientRepository.create(client)
    await inMemoryProfessionalRepository.create(professional)
    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      clientId: client.id,
      professionalId: professional.id,
      startDateTime: new Date('2023-01-01T10:00:00.000Z'),
      endDateTime: new Date('2023-01-01T11:01:00.000Z'),
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
