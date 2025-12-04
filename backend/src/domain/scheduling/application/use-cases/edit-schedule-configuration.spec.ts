import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeProfessional } from '@test/factories/make-professional'
import { makeScheduleConfiguration } from '@test/factories/make-schedule-configuration'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { EditScheduleConfigurationUseCase } from './edit-schedule-configuration'

let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository
let sut: EditScheduleConfigurationUseCase

describe('Edit Schedule Configuration', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryScheduleConfigurationRepository =
      new InMemoryScheduleConfigurationRepository()
    sut = new EditScheduleConfigurationUseCase(
      inMemoryProfessionalRepository,
      inMemoryScheduleConfigurationRepository
    )
  })

  it('should be able to edit a professional schedule configuration', async () => {
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = scheduleConfiguration.id

    inMemoryProfessionalRepository.save(professional)

    const response = await sut.execute({
      enableGoogleMeet: false,
      professionalId: professional.id.toString(),
      bufferIntervalMinutes: 120,
      holidays: [new Date('25-12-2025')],
      sessionDurationMinutes: 90,
      workingDays: new WorkingDaysList([1, 5, 6]),
      workingHours: {
        start: '15:00',
        end: '23:00',
      },
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(
        inMemoryScheduleConfigurationRepository.items[0]?.enableGoogleMeet
      ).toBe(false)
      expect(
        inMemoryScheduleConfigurationRepository.items[0]?.bufferIntervalMinutes
      ).toBe(120)
      expect(
        inMemoryScheduleConfigurationRepository.items[0]?.sessionDurationMinutes
      ).toBe(90)
    }
  })
})
