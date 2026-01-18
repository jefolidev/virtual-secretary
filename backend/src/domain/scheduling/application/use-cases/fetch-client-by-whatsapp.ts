import { Either, left, right } from '@/core/either'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { User } from '../../enterprise/entities/user'
import { UserRepository } from '../repositories/user.repository'

export interface FetchClientByWhatsappProps {
  whatsappNumber: string
}

type FetchClientByWhatsappResponse = Either<NotFoundError, { user: User }>

export class FetchClientByWhatsapp {
  constructor(private userRepository: UserRepository) {}

  async execute({
    whatsappNumber,
  }: FetchClientByWhatsappProps): Promise<FetchClientByWhatsappResponse> {
    const user = await this.userRepository.findByPhone(whatsappNumber)

    if (
      user?.role === 'PROFESSIONAL' ||
      user?.professionalId ||
      !user?.clientId
    ) {
      return left(new NotFoundError('Client not found'))
    }

    return right({ user })
  }
}
