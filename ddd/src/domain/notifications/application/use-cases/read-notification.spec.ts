import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { NotAllowedError } from '@src/core/errors/not-allowed-error'
import { makeNotification } from '@test/factories/make-notification'
import { InMemorySendNotificationRepository } from '@test/repositories/in-memory-send-notification.repository'
import { ReadNotificationUseCase } from './read-notification'

let inMemoryNotificationsRepository: InMemorySendNotificationRepository
let sut: ReadNotificationUseCase

describe('Read Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemorySendNotificationRepository()

    sut = new ReadNotificationUseCase(inMemoryNotificationsRepository)
  })

  it('should be able to read a notification', async () => {
    const notification = makeNotification()

    inMemoryNotificationsRepository.create(notification)

    const result = await sut.execute({
      recipientId: notification.recipientId.toString(),
      notificationId: notification.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    expect(inMemoryNotificationsRepository.items[0]!.readAt).toEqual(
      expect.any(Date)
    )
  })

  it('should not be able to read a notification from another user', async () => {
    const notification = makeNotification({
      recipientId: new UniqueEntityId('recipe-1'),
    })

    await inMemoryNotificationsRepository.create(notification)

    const result = await sut.execute({
      notificationId: notification.id.toString(),
      recipientId: 'recipient-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
