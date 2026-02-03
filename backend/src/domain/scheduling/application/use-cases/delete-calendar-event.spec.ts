import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryGoogleCalendarEventRepository } from '@test/repositories/in-memory-google-calendar-event.repository'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'
import { DeleteCalendarEventUseCase } from './delete-calendar-event'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryGoogleCalendarEventRepository: InMemoryGoogleCalendarEventRepository
let sut: DeleteCalendarEventUseCase

describe('Delete Calendar Event', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryGoogleCalendarEventRepository =
      new InMemoryGoogleCalendarEventRepository()

    sut = new DeleteCalendarEventUseCase(
      inMemoryGoogleCalendarEventRepository,
      inMemoryAppointmentRepository,
    )
  })

  it('should be able to delete a calendar event and cancel the appointment', async () => {
    const appointment = makeAppointment(
      {
        startDateTime: new Date('2026-03-15T14:00:00'),
        endDateTime: new Date('2026-03-15T15:00:00'),
      },
      new UniqueEntityId('appointment-id'),
    )

    await inMemoryAppointmentRepository.create(appointment)

    const event = GoogleCalendarEvent.create({
      appointmentId: appointment.id,
      professionalId: appointment.professionalId,
      googleEventLink: 'https://calendar.google.com/event?eid=123',
      summary: 'Appointment with patient',
      startDateTime: appointment.startDateTime,
      endDateTime: appointment.endDateTime,
      syncStatus: 'SYNCED',
    })

    await inMemoryGoogleCalendarEventRepository.create(
      appointment.id.toString(),
      event,
    )

    appointment.googleCalendarEventId = event.id.toString()
    await inMemoryAppointmentRepository.save(appointment)

    const response = await sut.execute({
      eventId: event.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(inMemoryGoogleCalendarEventRepository.items).toHaveLength(0)
    expect(appointment.status).toBe('CANCELLED')
  })

  it('should not be able to delete event when appointment is not found', async () => {
    const response = await sut.execute({
      eventId: 'non-existent-event-id',
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(response.value.message).toBe('Appointment not found')
    }
  })
})
