import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { User } from '../../enterprise/entities/user'
import { EditUserUseCase } from './edit-user'

let inMemoryUserRepository: InMemoryUserRepository
let sut: EditUserUseCase

describe('Edit User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    sut = new EditUserUseCase(inMemoryUserRepository)
  })

  it('should be able to edit a user', async () => {
    const user = User.create({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'Abc123456',
      cpf: '12345678900',
      whatsappNumber: '11999999999',
      birthDate: new Date('1990-01-01'),
      gender: 'MALE',
      role: 'PROFESSIONAL',
      professionalId: new UniqueEntityId('some-professional-id'),
      addressId: new UniqueEntityId('some-address-id'),
      clientId: undefined,
    })

    await inMemoryUserRepository.create(user)

    expect(user.email).toBe('johndoe@email.com')
    expect(user.whatsappNumber).toBe('11999999999')
    expect(user.name).toBe('John Doe')

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Jane Doe',
      email: 'janedoe@email.com',
      whatsappNumber: '11888888888',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const updatedUser = response.value.user

      expect(updatedUser.email).toBe('janedoe@email.com')
      expect(updatedUser.whatsappNumber).toBe('11888888888')
      expect(updatedUser.name).toBe('Jane Doe')
    }
  })
})
