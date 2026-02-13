import { User } from '../../enterprise/entities/user'
import { UserClientWhatsappAppointments } from '../../enterprise/entities/value-objects/user-with-clients-and-appointments'
import { WhatsappContact } from '../../enterprise/entities/whatsapp-contact'

export interface CookieClearOptions {
  response: any
  request: any
}

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>
  abstract findByPhone(whatsappNumber: string): Promise<User | null>
  abstract findByCpf(cpf: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>

  abstract findByClientId(clientId: string): Promise<User | null>
  abstract findByProfessionalId(professionalId: string): Promise<User | null>
  abstract findManyClientUsers(): Promise<User[] | null>
  abstract findManyProfessionalUsers(): Promise<User[] | null>

  abstract findManyUsersWithWhatsApp(): Promise<
    UserClientWhatsappAppointments[] | null
  >
  abstract fetchWhatsappRegisteredAndUnlinked(): Promise<{
    registred: UserClientWhatsappAppointments[]
    unlinked: WhatsappContact[]
  } | null>

  abstract getThreadId(
    whatsappNumber: string,
  ): Promise<string | null | undefined>
  abstract resetPassword(userId: string, password: string): Promise<void>
  abstract clearAuthCookies(options: CookieClearOptions): void
  abstract create(user: User): Promise<void>
  abstract save(user: User): Promise<void>
  abstract createClientByWhatsapp(data: {
    name: string
    email: string
    whatsappNumber: string
    cpf: string
    gender: 'MALE' | 'FEMALE'
    birthDate: Date
    periodPreference: ('MORNING' | 'AFTERNOON' | 'EVENING')[]
    complement: string | null
    cep: string
    number: string
    extraPreferences: string
  }): Promise<User>
}
