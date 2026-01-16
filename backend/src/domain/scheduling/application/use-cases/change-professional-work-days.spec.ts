import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeProfessional } from '@test/factories/make-professional'
import { makeScheduleConfiguration } from '@test/factories/make-schedule-configuration'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { ChangeProfessionalWorkDaysUseCase } from './change-professional-work-days'

let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository
let sut: ChangeProfessionalWorkDaysUseCase

describe('Edit Professional Work Days', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()

    inMemoryScheduleConfigurationRepository =
      new InMemoryScheduleConfigurationRepository()

    sut = new ChangeProfessionalWorkDaysUseCase(
      inMemoryProfessionalRepository,
      inMemoryScheduleConfigurationRepository
    )
  })

  it("should be able to edit a professional's work days", async () => {
    const professional = makeProfessional(
      {},
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        workingDays: new WorkingDaysList([1, 2, 3]),
      },
      new UniqueEntityId('schedule-configuration-id')
    )

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    professional.scheduleConfigurationId = scheduleConfiguration.id

    await inMemoryProfessionalRepository.save(professional)

    expect(scheduleConfiguration.workingDays.currentItems).toStrictEqual([
      1, 2, 3,
    ])

    const response = await sut.execute({
      professionalId: professional.id.toString(),
      newDays: [2, 3, 4, 5],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const updatedWorkingDays =
        response.value.scheduleConfiguration.workingDays

      expect(updatedWorkingDays.currentItems).toStrictEqual([2, 3, 4, 5])
    }
  })
})
