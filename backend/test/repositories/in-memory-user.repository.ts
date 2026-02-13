import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'
import {
  CookieClearOptions,
  UserRepository,
} from '@/domain/scheduling/application/repositories/user.repository'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { UserClientWhatsappAppointments } from '@/domain/scheduling/enterprise/entities/value-objects/user-with-clients-and-appointments'

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = []

  async findManyUsersWithWhatsApp(): Promise<
    UserClientWhatsappAppointments[] | null
  > {
    const usersWithWhatsApp = this.items
      .filter((user) => !!user.whatsappNumber)
      .map((user) =>
        UserClientWhatsappAppointments.create({
          user,
          client: null,
          whatsappContact: null,
          appointments: [],
        }),
      )

    return usersWithWhatsApp.length > 0 ? usersWithWhatsApp : null
  }

  private generateRandomPassword(): string {
    const length = 16
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }

    return password
  }

  clearAuthCookies({ response, request }: CookieClearOptions): void {
    // Implementação mock para testes
  }

  async getThreadId(
    whatsappNumber: string,
  ): Promise<string | null | undefined> {
    const user = this.items.find(
      (item) => item.whatsappNumber === whatsappNumber,
    )

    if (!user) return null

    if (!user.threadId) return undefined

    return user.threadId.toString()
  }

  async findByProfessionalId(professionalId: string): Promise<User | null> {
    const user = this.items.find(
      (item) =>
        item.professionalId !== undefined &&
        item.professionalId.equals(new UniqueEntityId(professionalId)),
    )

    if (!user) {
      return null
    }

    return user
  }

  async findManyClientUsers(): Promise<User[] | null> {
    const clientUsers = this.items.filter(
      (user) => user.clientId !== null && user.clientId !== undefined,
    )

    return clientUsers.length > 0 ? clientUsers : null
  }
  async findManyProfessionalUsers(): Promise<User[] | null> {
    const professionalUsers = this.items.filter(
      (user) =>
        user.professionalId !== null && user.professionalId !== undefined,
    )

    return professionalUsers.length > 0 ? professionalUsers : null
  }

  async createClientByWhatsapp(data: {
    name: string
    email: string
    whatsappNumber: string
    cpf: string
    gender: 'MALE' | 'FEMALE'
    birthDate: Date
    complement: string | null
    cep: string
    number: string
    extraPreferences: string
  }): Promise<User> {
    const user = User.create(
      {
        name: data.name,
        email: data.email,
        whatsappNumber: data.whatsappNumber,
        cpf: data.cpf,
        gender: data.gender,
        birthDate: data.birthDate,
        role: 'CLIENT',
        password: this.generateRandomPassword(),
      },
      new UniqueEntityId(),
    )

    this.items.push(user)

    DomainEvents.dispatchEventsForAggregate(user.id)

    return user
  }

  async findByClientId(clientId: string): Promise<User | null> {
    const user = this.items.find(
      (item) =>
        item.clientId !== undefined &&
        item.clientId.equals(new UniqueEntityId(clientId)),
    )

    if (!user) {
      return null
    }

    return user
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.items.find((item) =>
      item.id.equals(new UniqueEntityId(id)),
    )

    if (!user) {
      return null
    }

    return user
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async findByPhone(whatsappNumber: string) {
    const user = this.items.find(
      (item) => item.whatsappNumber === whatsappNumber,
    )

    if (!user) {
      return null
    }

    return user
  }

  async findByCpf(cpf: string) {
    const user = this.items.find((item) => item.cpf === cpf)

    if (!user) {
      return null
    }

    return user
  }

  async create(user: User) {
    this.items.push(user)

    DomainEvents.dispatchEventsForAggregate(user.id)
  }

  async resetPassword(userId: string, password: string): Promise<void> {
    const userIndex = await this.items.findIndex(
      (user) => user.id.toString() === userId,
    )

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    this.items[userIndex].password = password
  }

  async save(user: User): Promise<void> {
    const userIndex = this.items.findIndex((item) => item.id.equals(user.id))

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    this.items[userIndex] = user

    DomainEvents.dispatchEventsForAggregate(user.id)
  }
}
