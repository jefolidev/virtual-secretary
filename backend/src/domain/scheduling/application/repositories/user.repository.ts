import { User } from '../../enterprise/entities/user'

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract resetPassword(userId: string, password: string): Promise<void>
  abstract create(user: User): Promise<void>
}
