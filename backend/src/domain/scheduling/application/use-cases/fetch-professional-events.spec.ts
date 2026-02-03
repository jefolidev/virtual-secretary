import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryGoogleCalendarEventRepository } from '@test/repositories/in-memory-google-calendar-event.repository'
import { GoogleCalendarEvent } from '../../enterprise/entities/google-calendar-event'
import { FetchProfessionalEventsUseCase } from './fetch-professional-events'

let inMemoryGoogleCalendarEventRepository: InMemoryGoogleCalendarEventRepository
let sut: FetchProfessionalEventsUseCase

describe('Fetch Professional Events', () => {
  beforeEach(() => {
    inMemoryGoogleCalendarEventRepository =
      new InMemoryGoogleCalendarEventRepository()

    sut = new FetchProfessionalEventsUseCase(
      inMemoryGoogleCalendarEventRepository,
    )
  })

  it('should be able to fetch events for a professional', async () => {
    const professionalId = new UniqueEntityId('professional-123')

    for (let i = 1; i <= 5; i++) {
      const event = GoogleCalendarEvent.create({
        appointmentId: new UniqueEntityId(`appointment-${i}`),
        professionalId,
        googleEventLink: `https://calendar.google.com/event?eid=${i}`,
        summary: `Appointment ${i}`,
        startDateTime: new Date(`2026-03-${i + 10}T14:00:00`),
        endDateTime: new Date(`2026-03-${i + 10}T15:00:00`),
        syncStatus: 'SYNCED',
      })

      await inMemoryGoogleCalendarEventRepository.create(
        `appointment-${i}`,
        event,
      )
    }

    const response = await sut.execute({
      professionalId: professionalId.toString(),
      page: 1,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.events).toHaveLength(5)
      expect(response.value.events[0].summary).toBe('Appointment 1')
    }
  })

  it('should return empty array when professional has no events', async () => {
    const response = await sut.execute({
      professionalId: 'professional-without-events',
      page: 1,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.events).toEqual([])
    }
  })

  it('should paginate events correctly', async () => {
    const professionalId = new UniqueEntityId('professional-123')

    // Create 25 events
    for (let i = 1; i <= 25; i++) {
      const event = GoogleCalendarEvent.create({
        appointmentId: new UniqueEntityId(`appointment-${i}`),
        professionalId,
        googleEventLink: `https://calendar.google.com/event?eid=${i}`,
        summary: `Appointment ${i}`,
        startDateTime: new Date(`2026-03-15T${10 + i}:00:00`),
        endDateTime: new Date(`2026-03-15T${11 + i}:00:00`),
        syncStatus: 'SYNCED',
      })

      await inMemoryGoogleCalendarEventRepository.create(
        `appointment-${i}`,
        event,
      )
    }

    const firstPageResponse = await sut.execute({
      professionalId: professionalId.toString(),
      page: 1,
    })

    const secondPageResponse = await sut.execute({
      professionalId: professionalId.toString(),
      page: 2,
    })

    expect(firstPageResponse.isRight()).toBe(true)
    expect(secondPageResponse.isRight()).toBe(true)

    if (firstPageResponse.isRight() && secondPageResponse.isRight()) {
      expect(firstPageResponse.value.events).toHaveLength(20) // Default perPage = 20
      expect(secondPageResponse.value.events).toHaveLength(5) // Remaining 5
    }
  })
})
