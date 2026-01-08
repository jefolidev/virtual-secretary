import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { User } from '../../enterprise/entities/user'
import { UserRepository } from '../repositories/user.repository'
import { ConflictError } from './errors/conflict-error'

export interface EditUserUseCaseRequest {
  userId: string
  name?: string
  email?: string
  phone?: string
}

export type EditUserUseCaseResponse = Either<
  NotAllowedError | NotFoundError | ConflictError,
  {
    user: User
  }
>

@Injectable()
export class EditUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    email,
    name,
    phone,
  }: EditUserUseCaseRequest): Promise<EditUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) return left(new NotFoundError('User not found.'))

    if (!user.id.equals(new UniqueEntityId(userId))) {
      return left(new NotAllowedError())
    }

    if (email) {
      const emailAlreadyExists = await this.userRepository.findByEmail(email)

      if (emailAlreadyExists && emailAlreadyExists.id !== user.id) {
        return left(new ConflictError('Email already in use.'))
      }
    }

    if (phone) {
      const phoneAlreadyExists = await this.userRepository.findByPhone(phone)

      if (phoneAlreadyExists && phoneAlreadyExists.id !== user.id) {
        return left(new ConflictError('Phone already in use.'))
      }
    }

    user.email = email ?? user.email
    user.name = name ?? user.name
    user.phone = phone ?? user.phone

    await this.userRepository.save(user)

    return right({
      user,
    })
  }
}
