import { Either, left, right } from '@/core/either'
import { checkPasswordStrong } from '@/utils/checkPasswordStrong'
import { Injectable } from '@nestjs/common'
import { Address, AddressProps } from '../../enterprise/entities/address'
import { Client } from '../../enterprise/entities/client'
import { Professional } from '../../enterprise/entities/professional'
import { User } from '../../enterprise/entities/user'
import { NotificationSettings } from '../../enterprise/entities/value-objects/notification-settings'
import { HashGenerator } from '../cryptography/hash-generator'
import { AddressRepository } from '../repositories/address.repository'
import { ClientRepository } from '../repositories/client.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { UserRepository } from '../repositories/user.repository'
import { UserAlreadyExists } from './errors/user-already-exists'
import { WeakPasswordError } from './errors/weak-password-error'

interface RegisterUserUseCaseRequest {
  name: string
  email: string
  password: string
  phone: string
  cpf: string
  address: AddressProps
  professionalData?: {
    sessionPrice: number
    notificationSettings?: NotificationSettings
  }
  clientData?: {
    periodPreference: ('MORNING' | 'AFTERNOON' | 'EVENING')[]
    extraPreferences?: string
  }
  role: 'PROFESSIONAL' | 'CLIENT'
}

type RegisterUserUseCaseResponse = Either<UserAlreadyExists, { user: User }>

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashGenerator: HashGenerator,
    private readonly clientRepository: ClientRepository,
    private readonly professionalRepository: ProfessionalRepository,
    private readonly addressRepository: AddressRepository
  ) {}

  async execute({
    name,
    email,
    password,
    phone,
    cpf,
    address,
    role,
    professionalData,
    clientData,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    // Validações ANTES de persistir qualquer dado
    const userWithSameEmail = await this.userRepository.findByEmail(email)

    if (userWithSameEmail) {
      return left(new UserAlreadyExists())
    }

    const isStrongPassword = checkPasswordStrong(password)

    if (!isStrongPassword.isValid) {
      throw new WeakPasswordError(isStrongPassword.errors)
    }

    // Após validações, criar e persistir as entidades
    const hashedPassword = await this.hashGenerator.hash(password)

    const userAddress = Address.create(address)
    await this.addressRepository.create(userAddress)

    let professional: Professional | undefined = undefined
    let client: Client | undefined = undefined

    if (role === 'PROFESSIONAL') {
      professional = Professional.create({
        sessionPrice: professionalData?.sessionPrice ?? 0,
        notificationSettings: professionalData?.notificationSettings,
      })

      await this.professionalRepository.create(professional)
    }

    if (role === 'CLIENT') {
      client = Client.create({
        appointmentHistory: [],
        extraPreferences: clientData?.extraPreferences,
        periodPreference: clientData?.periodPreference,
      })

      await this.clientRepository.create(client)
    }

    const user = User.create({
      addressId: userAddress.id,
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
