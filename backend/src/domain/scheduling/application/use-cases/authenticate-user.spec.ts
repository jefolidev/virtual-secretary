import { FakeEncrypter } from '@test/cryptography/fake-encrypter'
import { FakeHasher } from '@test/cryptography/fake-hasher'
import { UserFactory } from '@test/factories/make-user'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { AuthenticateStudentUseCase } from './authenticate-user'

let inMemoryUserRepository: InMemoryUserRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter

let sut: AuthenticateStudentUseCase

describe('Authenticate Student', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()
    encrypter = new FakeEncrypter()

    sut = new AuthenticateStudentUseCase(
      inMemoryUserRepository,
      fakeHasher,
      encrypter
    )
  })

  it('should be able to authenticate a student', async () => {
    const hashedPassword = await fakeHasher.hash('123456')
    const user = await UserFactory.makeClientUser({
      email: 'johndoe@example.com',
      password: hashedPassword,
    })

    inMemoryUserRepository.items.push(user)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })
})
