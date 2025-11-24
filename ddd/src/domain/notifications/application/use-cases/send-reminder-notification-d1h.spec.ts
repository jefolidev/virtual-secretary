import { InMemorySendNotificationRepository } from '@test/repositories/in-memory-send-notification.repository'
import { SendReminderNotificationUseCase } from './send-reminder-notification-d1h'

let inMemoryNotificationsRepository: InMemorySendNotificationRepository
let sut: SendReminderNotificationUseCase

describe('Create Reminder Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemorySendNotificationRepository()

    sut = new SendReminderNotificationUseCase(inMemoryNotificationsRepository)
  })

  it('should be able to send D-1 reminder notification', async () => {
    const result = await sut.execute({
      userId: '1',
      title: 'Incoming appointment',
      content: 'You have an appointment in 18 hours.',
      reminderType: 'first_reminder',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(inMemoryNotificationsRepository.items[0]).toEqual(
        result.value?.notification
      )
      expect(
        inMemoryNotificationsRepository.items[0]?.recipientId.toString()
      ).toEqual('1')
      expect(inMemoryNotificationsRepository.items[0]?.title).toEqual(
        'Incoming appointment'
      )
      expect(inMemoryNotificationsRepository.items[0]?.content).toEqual(
        'You have an appointment in 18 hours.'
      )
      expect(inMemoryNotificationsRepository.items[0]?.reminderType).toEqual(
        'first_reminder'
      )
      expect(
        inMemoryNotificationsRepository.items[0]?.createdAt
      ).toBeInstanceOf(Date)
    }
  })

  it('should be able to send T-2 reminder notification', async () => {
    const result = await sut.execute({
      userId: '1',
      title: 'Incoming appointment',
      content: 'You have an appointment in 2 hours.',
      reminderType: 'confirmation',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(inMemoryNotificationsRepository.items[0]).toEqual(
        result.value?.notification
      )
      expect(
        inMemoryNotificationsRepository.items[0]?.recipientId.toString()
      ).toEqual('1')
      expect(inMemoryNotificationsRepository.items[0]?.title).toEqual(
        'Incoming appointment'
      )
      expect(inMemoryNotificationsRepository.items[0]?.content).toEqual(
        'You have an appointment in 2 hours.'
      )
      expect(inMemoryNotificationsRepository.items[0]?.reminderType).toEqual(
        'confirmation'
      )
      expect(
        inMemoryNotificationsRepository.items[0]?.createdAt
      ).toBeInstanceOf(Date)
    }
  })

  it('should be able to send T-30min reminder notification', async () => {
    const result = await sut.execute({
      userId: '1',
      title: 'Incoming appointment',
      content: 'You have an appointment in 30 minutes.',
      reminderType: 'final_reminder',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(inMemoryNotificationsRepository.items[0]).toEqual(
        result.value?.notification
      )
      expect(
        inMemoryNotificationsRepository.items[0]?.recipientId.toString()
      ).toEqual('1')
      expect(inMemoryNotificationsRepository.items[0]?.title).toEqual(
        'Incoming appointment'
      )
      expect(inMemoryNotificationsRepository.items[0]?.content).toEqual(
        'You have an appointment in 30 minutes.'
      )
      expect(inMemoryNotificationsRepository.items[0]?.reminderType).toEqual(
        'final_reminder'
      )
      expect(
        inMemoryNotificationsRepository.items[0]?.createdAt
      ).toBeInstanceOf(Date)
    }
  })
})
