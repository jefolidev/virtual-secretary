import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Client } from '../../enterprise/entities/client'
import { Professional } from '../../enterprise/entities/professional'
import { AddressProps, User } from '../../enterprise/entities/user'
import { HashGenerator } from '../cryptography/hash-generator'
import { UserRepository } from '../repositories/user.repository'
import { UserAlreadyExists } from './errors/user-already-exists'

interface RegisterUserUseCaseRequest {
  name: string
  email: string
  password: string
  phone: string
  address: AddressProps
  cpf: string
  role: 'PROFESSIONAL' | 'CLIENT'
}

type RegisterUserUseCaseResponse = Either<UserAlreadyExists, { user: User }>

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashGenerator: HashGenerator
  ) {}

  async execute({
    address,
    name,
    email,
    password,
    phone,
    cpf,
    role,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameEmail = await this.userRepository.findByEmail(email)

    let professional: Professional | undefined = undefined
    let client: Client | undefined = undefined

    if (role === 'PROFESSIONAL') {
      professional = Professional.create({
        name,
        phone,
        sessionPrice: 0,
      })
    }

    if (role === 'CLIENT') {
      client = Client.create({
        name,
        phone,
        appointmentHistory: [],
      })
    }

    if (userWithSameEmail) {
      return left(new UserAlreadyExists())
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const user = User.create({
      address,
      name,
      email,
      password: hashedPassword,
      cpf,
      role,
      phone,
      professionalId: professional?.id,
      clientId: client?.id,
    })

    await this.userRepository.create(user)

    return right({ user })
  }
}
