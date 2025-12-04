import { InMemorySendNotificationRepository } from '@test/repositories/in-memory-send-notification.repository'
import { SendNotificationUseCase } from './send-notification'

let inMemoryNotificationsRepository: InMemorySendNotificationRepository
let sut: SendNotificationUseCase

describe('Create Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemorySendNotificationRepository()

    sut = new SendNotificationUseCase(inMemoryNotificationsRepository)
  })

  it('should be able to send a notification', async () => {
    const result = await sut.execute({
      recipientId: '1',
      title: 'Nova Notificacao',
      content: 'Conteudo da Notificacao',
    })

    expect(result.isRight()).toBe(true)

    expect(inMemoryNotificationsRepository.items[0]).toEqual(
      result.value?.notification
    )
  })
})
