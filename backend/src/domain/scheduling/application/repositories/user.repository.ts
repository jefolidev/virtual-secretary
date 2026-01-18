import { User } from '../../enterprise/entities/user'

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>
  abstract findByPhone(whatsappNumber: string): Promise<User | null>
  abstract findByCpf(cpf: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract getThreadId(whatsappNumber: string): Promise<string | null | undefined>
  abstract resetPassword(userId: string, password: string): Promise<void>
  abstract create(user: User): Promise<void>
  abstract save(user: User): Promise<void>
}
