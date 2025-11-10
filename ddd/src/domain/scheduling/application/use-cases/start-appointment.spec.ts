import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { BadRequestError } from '@src/core/errors/bad-request'
import { NotAllowedError } from '@src/core/errors/not-allowed-error'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { StartAppointmentUseCase } from './start-appointment'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository
let sut: StartAppointmentUseCase

describe('Start Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryClientRepository = new InMemoryClientRepository()
    sut = new StartAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryClientRepository,
      inMemoryProfessionalRepository
    )
  })

  it('should be able to start an appointment', async () => {
    const client = makeClient({}, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const appointment = makeAppointment(
      {
        professionalId: professional.id,
        clientId: client.id,
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      appointmentId: appointment.id.toString(),
      professionalId: professional.id.toString(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(inMemoryAppointmentRepository.items[0]?.status).toBe('IN_PROGRESS')

      expect(inMemoryAppointmentRepository.items).toHaveLength(1)
      expect(inMemoryProfessionalRepository.items).toHaveLength(1)
      expect(inMemoryClientRepository.items).toHaveLength(1)
    }
  })

  it('should not be able to start an appointment if professional not allowed', async () => {
    const client = makeClient({}, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const anotherProfessional = makeProfessional(
      {},
      new UniqueEntityId('another-professional-id')
    )

    await inMemoryProfessionalRepository.create(anotherProfessional)

    const appointment = makeAppointment(
      {
        professionalId: professional.id,
        clientId: client.id,
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      appointmentId: appointment.id.toString(),
      professionalId: anotherProfessional.id.toString(),
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(inMemoryAppointmentRepository.items[0]?.status).toBe('SCHEDULED')

      expect(response.value).toBeInstanceOf(NotAllowedError)
    }
  })

  it('should not be able to start an appointment if already started', async () => {
    const client = makeClient({}, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const appointment = makeAppointment(
      {
        professionalId: professional.id,
        clientId: client.id,
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(appointment)

    appointment.status = 'COMPLETED'

    const response = await sut.execute({
      appointmentId: appointment.id.toString(),
      professionalId: professional.id.toString(),
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(inMemoryAppointmentRepository.items[0]?.status).toBe('COMPLETED')

      expect(response.value).toBeInstanceOf(BadRequestError)
    }
  })
})
