import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { NotificationSettings } from '../../enterprise/entities/value-objects/notification-settings'
import { EditProfessionalUseCase } from './edit-professional'

let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: EditProfessionalUseCase

describe('Edit Professional', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    sut = new EditProfessionalUseCase(inMemoryProfessionalRepository)
  })

  it('should be able to edit a professional', async () => {
    const professional = makeProfessional(
      {
        notificationSettings: NotificationSettings.create({
          channels: ['EMAIL'],
          dailySummaryTime: '09:00',
          enabledTypes: ['CONFIRMATION'],
          reminderBeforeMinutes: 30,
        }),
        sessionPrice: 100,
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    // Verificar estado inicial
    expect(professional.sessionPrice).toBe(100)
    expect(professional.notificationSettings?.channels).toStrictEqual(['EMAIL'])
    expect(professional.notificationSettings?.dailySummaryTime).toBe('09:00')
    expect(professional.notificationSettings?.enabledTypes).toStrictEqual([
      'CONFIRMATION',
    ])
    expect(professional.notificationSettings?.reminderBeforeMinutes).toBe(30)

    const response = await sut.execute({
      professionalId: professional.id.toString(),
      channels: ['WHATSAPP', 'EMAIL'],
      dailySummaryTime: '18:00',
      enabledTypes: ['CANCELLATION', 'DAILY_SUMMARY'],
      reminderBeforeMinutes: 60,
      sessionPrice: 150,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const updatedProfessional = response.value.professional

      // Verificar se o professional retornado foi atualizado
      expect(updatedProfessional.sessionPrice).toBe(150)
      expect(updatedProfessional.notificationSettings?.channels).toStrictEqual([
        'WHATSAPP',
        'EMAIL',
      ])
      expect(updatedProfessional.notificationSettings?.dailySummaryTime).toBe(
        '18:00'
      )
      expect(
        updatedProfessional.notificationSettings?.enabledTypes
      ).toStrictEqual(['CANCELLATION', 'DAILY_SUMMARY'])
      expect(
        updatedProfessional.notificationSettings?.reminderBeforeMinutes
      ).toBe(60)

      // Verificar se foi salvo corretamente no repositório
      const savedProfessional = await inMemoryProfessionalRepository.findById(
        professional.id.toString()
      )
      expect(savedProfessional).toBeTruthy()
      expect(savedProfessional?.sessionPrice).toBe(150)
      expect(savedProfessional?.notificationSettings?.channels).toStrictEqual([
        'WHATSAPP',
        'EMAIL',
      ])
      expect(savedProfessional?.notificationSettings?.dailySummaryTime).toBe(
        '18:00'
      )
      expect(
        savedProfessional?.notificationSettings?.enabledTypes
      ).toStrictEqual(['CANCELLATION', 'DAILY_SUMMARY'])
      expect(
        savedProfessional?.notificationSettings?.reminderBeforeMinutes
      ).toBe(60)
    }
  })

  it('should be able to edit only specific fields', async () => {
    const professional = makeProfessional(
      {
        notificationSettings: NotificationSettings.create({
          channels: ['EMAIL'],
          dailySummaryTime: '09:00',
          enabledTypes: ['CONFIRMATION'],
          reminderBeforeMinutes: 30,
        }),
        sessionPrice: 100,
      },
      new UniqueEntityId('professional-id-2')
    )

    await inMemoryProfessionalRepository.create(professional)

    // Atualizar apenas sessionPrice
    const response = await sut.execute({
      professionalId: professional.id.toString(),
      sessionPrice: 200,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const updatedProfessional = response.value.professional

      // Verificar que apenas sessionPrice foi alterado
      expect(updatedProfessional.sessionPrice).toBe(200)
      // Verificar que notification settings permaneceram inalteradas
      expect(updatedProfessional.notificationSettings?.channels).toStrictEqual([
        'EMAIL',
      ])
      expect(updatedProfessional.notificationSettings?.dailySummaryTime).toBe(
        '09:00'
      )
      expect(
        updatedProfessional.notificationSettings?.enabledTypes
      ).toStrictEqual(['CONFIRMATION'])
      expect(
        updatedProfessional.notificationSettings?.reminderBeforeMinutes
      ).toBe(30)
    }
  })
})
