import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryGoogleCalendarEventRepository } from '@test/repositories/in-memory-google-calendar-event.repository'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'
import { EditCalendarEventUseCase } from './edit-calendar-event'

let inMemoryGoogleCalendarEventRepository: InMemoryGoogleCalendarEventRepository
let sut: EditCalendarEventUseCase

describe('Edit Calendar Event', () => {
  beforeEach(() => {
    inMemoryGoogleCalendarEventRepository =
      new InMemoryGoogleCalendarEventRepository()

    sut = new EditCalendarEventUseCase(inMemoryGoogleCalendarEventRepository)
  })

  it('should be able to edit a calendar event', async () => {
    const professionalId = new UniqueEntityId('professional-123')
    const appointmentId = new UniqueEntityId('appointment-123')

    const event = GoogleCalendarEvent.create({
      appointmentId,
      professionalId,
      googleEventLink: 'https://calendar.google.com/event?eid=123',
      summary: 'Original summary',
      description: 'Original description',
      startDateTime: new Date('2026-03-15T14:00:00'),
      endDateTime: new Date('2026-03-15T15:00:00'),
      syncStatus: 'SYNCED',
    })

    await inMemoryGoogleCalendarEventRepository.create(
      appointmentId.toString(),
      event,
    )

    const response = await sut.execute({
      professionalId: professionalId.toString(),
      eventId: event.id.toString(),
      data: {
        summary: 'Updated summary',
        description: 'Updated description',
        startDateTime: new Date('2026-03-15T15:00:00'),
        endDateTime: new Date('2026-03-15T16:00:00'),
      },
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.eventId).toBe(event.id.toString())
    }
  })
})
