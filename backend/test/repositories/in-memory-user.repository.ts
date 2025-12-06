import { DomainEvents } from '@/core/events/domain-events'
import { UserRepository } from '@/domain/scheduling/application/repositories/user.repository'
import { User } from '@/domain/scheduling/enterprise/entities/user'

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = []

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

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
      (user) => user.id.toString() === userId
    )

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    this.items[userIndex].password = password
  }
}
