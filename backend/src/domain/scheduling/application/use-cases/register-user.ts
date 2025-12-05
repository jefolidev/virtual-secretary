import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Client } from '../../enterprise/entities/client'
import { Professional } from '../../enterprise/entities/professional'
import { AddressProps, User } from '../../enterprise/entities/user'
import { HashGenerator } from '../cryptography/hash-generator'
import { ClientRepository } from '../repositories/client.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
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
    private readonly hashGenerator: HashGenerator,
    private readonly clientRepository: ClientRepository,
    private readonly professionalRepository: ProfessionalRepository
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
      // persist professional before creating the user so FK constraints are satisfied
      await this.professionalRepository.create(professional)
    }

    if (role === 'CLIENT') {
      client = Client.create({
        name,
        phone,
        appointmentHistory: [],
      })
      // persist client before creating the user so FK constraints are satisfied
      await this.clientRepository.create(client)
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
