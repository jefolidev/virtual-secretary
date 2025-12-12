import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import { Professional } from '../../enterprise/entities/professional'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { CreateScheduleConfigurationUseCase } from './create-schedule-configuration'
import { ConflictError } from './errors/conflict-error'

let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: CreateScheduleConfigurationUseCase

describe('Create ScheduleConfiguration', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryScheduleConfigurationRepository =
      new InMemoryScheduleConfigurationRepository()

    sut = new CreateScheduleConfigurationUseCase(
      inMemoryScheduleConfigurationRepository,
      inMemoryProfessionalRepository
    )
  })

  it('should be able to create a schedule configuration', async () => {
    const professional = Professional.create(
      {
        sessionPrice: 100,
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = {
      professionalId: 'professional-id',
      bufferIntervalMinutes: 60,
      sessionDurationMinutes: 50,
      workingDays: new WorkingDaysList(),
      workingHours: { start: '09:00', end: '21:00' },
      enableGoogleMeet: false,
      holidays: [],
    }

    scheduleConfiguration.workingDays.add(1)
    const result = await sut.execute(scheduleConfiguration)

    expect(result.isRight()).toBe(true)
  })

  it('should not be able to create schedule configuration for non-existent professional', async () => {
    const scheduleConfiguration = {
      professionalId: 'professional-id',
      bufferIntervalMinutes: 60,
      sessionDurationMinutes: 50,
      workingDays: new WorkingDaysList(),
      workingHours: { start: '09:00', end: '21:00' },
      enableGoogleMeet: false,
      holidays: [],
    }

    scheduleConfiguration.workingDays.add(1)
    const result = await sut.execute(scheduleConfiguration)

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should not be able to create schedule configuration if professional already has one', async () => {
    const professional = makeProfessional(
      {
        scheduleConfigurationId: new UniqueEntityId('schedule-id'),
      },
      new UniqueEntityId('professional-id')
    )

    inMemoryProfessionalRepository.create(professional)

    const result = await sut.execute({
      professionalId: 'professional-id',
      bufferIntervalMinutes: 60,
      sessionDurationMinutes: 50,
      workingDays: new WorkingDaysList(),
      workingHours: { start: '09:00', end: '21:00' },
      enableGoogleMeet: false,
      holidays: [],
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ConflictError)
    }
  })
})
