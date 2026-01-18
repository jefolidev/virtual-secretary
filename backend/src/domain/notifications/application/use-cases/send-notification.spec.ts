import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemorySendNotificationRepository } from '@test/repositories/in-memory-send-notification.repository'
import { SendNotificationUseCase } from './send-notification'

let inMemoryNotificationsRepository: InMemorySendNotificationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: SendNotificationUseCase

describe('Create Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemorySendNotificationRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()

    sut = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
      inMemoryProfessionalRepository,
    )
  })

  it('should be able to send a notification', async () => {
    const result = await sut.execute({
      recipientId: '1',
      title: 'Nova Notificacao',
      content: 'Conteudo da Notificacao',
      reminderType: 'CONFIRMED_LIST',
    })

    expect(result.isRight()).toBe(true)

    expect(inMemoryNotificationsRepository.items[0]).toEqual(
      result.value?.notification,
    )
  })

  it('should not send notification if professional has disabled the type', async () => {
    const notificationSettings = NotificationSettings.create({
      channels: ['EMAIL'],
      enabledTypes: ['WELCOME', 'PAYMENT_STATUS'],
      reminderBeforeMinutes: 30,
      dailySummaryTime: '18:00',
    })

    const professional = makeProfessional(
      {
        notificationSettings,
      },
      new UniqueEntityId('profissional-id'),
    )

    await inMemoryProfessionalRepository.create(professional)

    const result = await sut.execute({
      recipientId: 'profissional-id',
      title: 'Nova Notificacao',
      content: 'Conteudo da Notificacao',
      reminderType: 'REMOVAL',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({})

    expect(inMemoryNotificationsRepository.items).toHaveLength(0)
  })
})
