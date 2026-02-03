import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAddress } from '@test/factories/make-address'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryGoogleCalendarEventRepository } from '@test/repositories/in-memory-google-calendar-event.repository'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { User } from '../../enterprise/entities/user'
import { CreateCalendarEventUseCase } from './create-calendar-event'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryGoogleCalendarEventRepository: InMemoryGoogleCalendarEventRepository
let inMemoryUserRepository: InMemoryUserRepository
let sut: CreateCalendarEventUseCase

describe('Create Calendar Event', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryGoogleCalendarEventRepository =
      new InMemoryGoogleCalendarEventRepository()
    inMemoryUserRepository = new InMemoryUserRepository()

    sut = new CreateCalendarEventUseCase(
      inMemoryAppointmentRepository,
      inMemoryGoogleCalendarEventRepository,
      inMemoryUserRepository,
    )
  })

  it('should be able to create a calendar event for an appointment', async () => {
    const client = makeClient({}, new UniqueEntityId('client-id'))
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id'),
    )

    const address = makeAddress()
    const user = User.create(
      {
        clientId: client.id,
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '07609254371',
        password: 'password123',
        gender: 'MALE',
        birthDate: new Date('1990-01-01'),
        role: 'CLIENT',
        whatsappNumber: '+5511999999999',
        addressId: address.id,
      },
      new UniqueEntityId('user-id'),
    )

    await inMemoryUserRepository.create(user)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        startDateTime: new Date('2026-03-15T14:00:00'),
        endDateTime: new Date('2026-03-15T15:00:00'),
      },
      new UniqueEntityId('appointment-id'),
    )

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      appointmentId: 'appointment-id',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { eventId, eventLink } = response.value

      expect(eventId).toBeTruthy()
      expect(eventLink).toBe('')
      expect(appointment.googleCalendarEventId).toBe(eventId)
    }
  })

  it('should not be able to create a calendar event for a non-existent appointment', async () => {
    const response = await sut.execute({
      appointmentId: 'non-existent-appointment-id',
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(response.value.message).toBe('Appointment not found')
    }
  })

  it('should not be able to create a calendar event when user is not found', async () => {
    const client = makeClient({}, new UniqueEntityId('client-id'))
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id'),
    )

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        startDateTime: new Date('2026-03-15T14:00:00'),
        endDateTime: new Date('2026-03-15T15:00:00'),
      },
      new UniqueEntityId('appointment-id'),
    )

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      appointmentId: 'appointment-id',
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(response.value.message).toBe('User not found')
    }
  })
})
