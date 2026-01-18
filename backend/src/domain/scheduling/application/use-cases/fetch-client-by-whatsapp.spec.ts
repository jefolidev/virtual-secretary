import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { UserFactory } from '@test/factories/make-user'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { FetchClientByWhatsapp } from './fetch-client-by-whatsapp'

let inMemoryUserRepository: InMemoryUserRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let sut: FetchClientByWhatsapp

describe('Fetch Client by Whatsapp', async () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    sut = new FetchClientByWhatsapp(inMemoryUserRepository)
  })

  it('should be able to fetch client by whatsapp', async () => {
    const client = await UserFactory.makeClientUser()

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

  it('should not be able to fetch if user is not a client', async () => {
    const user = await UserFactory.makeProfessionalUser()

    await inMemoryUserRepository.create(user)

    const response = await sut.execute({
      whatsappNumber: user.whatsappNumber,
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotFoundError)
    }
  })
})
