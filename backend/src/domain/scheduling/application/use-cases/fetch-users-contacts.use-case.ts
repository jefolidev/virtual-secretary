import { Injectable } from '@nestjs/common'
import { UserClientWhatsappAppointments } from '../../enterprise/entities/value-objects/user-with-clients-and-appointments'
import { UserRepository } from '../repositories/user.repository'

@Injectable()
export class FetchUsersContactsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserClientWhatsappAppointments[] | null> {
    return this.userRepository.findManyUsersWithWhatsApp()
  }
}
