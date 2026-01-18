import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { UserFactory } from '@test/factories/make-user'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { FakeThreadGenerator } from '@test/webhooks/openai/fake-thread-generator'
import { GetOrSetClientThreadUseCase } from './get-or-set-client-thread'

let inMemoryUserRepository: InMemoryUserRepository
let fakeThread: FakeThreadGenerator

let sut: GetOrSetClientThreadUseCase

describe('Fetch Client by Whatsapp', async () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    fakeThread = new FakeThreadGenerator()
    sut = new GetOrSetClientThreadUseCase(inMemoryUserRepository, fakeThread)
  })

  it('should be able to get the thread id for a client', async () => {
    const client = await UserFactory.makeClientUser({
      threadId: new UniqueEntityId('thread-123'),
    })

    await inMemoryUserRepository.create(client)

    const response = await sut.execute({
      whatsappNumber: client.whatsappNumber,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(inMemoryUserRepository.items[0].whatsappNumber).toEqual(
        client.whatsappNumber,
      )
    }
  })

  it('should be able to set the thread id for a client if he does not have one', async () => {
    const user = await UserFactory.makeClientUser()

    await inMemoryUserRepository.create(user)

    expect(user.threadId).toBeUndefined()

    const response = await sut.execute({
      whatsappNumber: user.whatsappNumber,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(inMemoryUserRepository.items[0].threadId).toBeTruthy()
    }
  })
})
