import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeProfessional } from '@test/factories/make-professional'
import { makeScheduleConfiguration } from '@test/factories/make-schedule-configuration'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import { ChangeProfessionalWorkHoursUseCase } from './change-professional-work-hours'

let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository
let sut: ChangeProfessionalWorkHoursUseCase

describe('Edit Professional Work Hours', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()

    inMemoryScheduleConfigurationRepository =
      new InMemoryScheduleConfigurationRepository()

    sut = new ChangeProfessionalWorkHoursUseCase(
      inMemoryProfessionalRepository,
      inMemoryScheduleConfigurationRepository
    )
  })

  it("should be able to edit a professional's work hours", async () => {
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        workingHours: { start: '08:00', end: '17:00' },
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = scheduleConfiguration.id

    await inMemoryProfessionalRepository.save(professional)

    expect(scheduleConfiguration.workingHours).toStrictEqual({
      start: '08:00',
      end: '17:00',
    })

    const response = await sut.execute({
      professionalId: professional.id.toString(),
      newStartHour: '09:00',
      newEndHour: '18:00',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const updatedWorkingHours =
        response.value.scheduleConfiguration.workingHours

      expect(updatedWorkingHours).toStrictEqual({
        start: '09:00',
        end: '18:00',
      })
    }
  })

  it("should be able to edit only the professional's start work hour", async () => {
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        workingHours: { start: '08:00', end: '17:00' },
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = scheduleConfiguration.id

    await inMemoryProfessionalRepository.save(professional)

    expect(scheduleConfiguration.workingHours).toStrictEqual({
      start: '08:00',
      end: '17:00',
    })

    const response = await sut.execute({
      professionalId: professional.id.toString(),
      newStartHour: '09:00',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const updatedWorkingHours =
        response.value.scheduleConfiguration.workingHours

      expect(updatedWorkingHours).toStrictEqual({
        start: '09:00',
        end: '17:00',
      })
    }
  })
  it("should be able to edit only the professional's end work hour", async () => {
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        workingHours: { start: '08:00', end: '17:00' },
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = scheduleConfiguration.id

    await inMemoryProfessionalRepository.save(professional)

    expect(scheduleConfiguration.workingHours).toStrictEqual({
      start: '08:00',
      end: '17:00',
    })

    const response = await sut.execute({
      professionalId: professional.id.toString(),
      newEndHour: '18:00',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const updatedWorkingHours =
        response.value.scheduleConfiguration.workingHours

      expect(updatedWorkingHours).toStrictEqual({
        start: '08:00',
        end: '18:00',
      })
    }
  })
})
