import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeProfessional } from '@test/factories/make-professional'
import { makeScheduleConfiguration } from '@test/factories/make-schedule-configuration'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import { FetchAvailableSlotsUseCase } from './fetch-available-slots'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository
let sut: FetchAvailableSlotsUseCase

describe('Fetch Available Slots From Professional', async () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryScheduleConfigurationRepository =
      new InMemoryScheduleConfigurationRepository()
    sut = new FetchAvailableSlotsUseCase(
      inMemoryProfessionalRepository,
      inMemoryScheduleConfigurationRepository,
      inMemoryAppointmentRepository
    )
  })

  it('should be able to fetch available slots from professional', async () => {
    const client = makeAppointment({
      clientId: new UniqueEntityId('any-client-id'),
    })

    await inMemoryAppointmentRepository.create(client)

    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: new UniqueEntityId('professional-id'),
        workingHours: { start: '10:00', end: '12:59' },
        sessionDurationMinutes: 60,
        bufferIntervalMinutes: 10,
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    scheduleConfiguration.workingDays.currentItems = [0] // Domingo

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = scheduleConfiguration.id
    await inMemoryProfessionalRepository.save(professional)

    const appointment = makeAppointment({
      professionalId: professional.id,
      startDateTime: new Date('2025-07-13T10:00:00Z'), // 10:00 UTC
      endDateTime: new Date('2025-07-13T11:00:00Z'), // 11:00 UTC
    })

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      professionalId: professional.id.toString(),
      startDate: new Date('2025-07-13T00:00:00Z'),
      endDate: new Date('2025-07-13T23:59:59Z'),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.slots).toHaveLength(2)
    }
  })
})
