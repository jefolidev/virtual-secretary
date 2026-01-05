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
import { CpfAlreadyExists } from './errors/cpf-already-exists'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists'
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

type RegisterUserUseCaseResponse = Either<
  UserAlreadyExists | PhoneAlreadyExistsError | CpfAlreadyExists,
  { user: User }
>

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

    const userWithSamePhone = await this.userRepository.findByPhone(phone)

    if (userWithSamePhone) {
      return left(new PhoneAlreadyExistsError())
    }
    const userWithSameCpf = await this.userRepository.findByCpf(cpf)

    if (userWithSameCpf) {
      return left(new CpfAlreadyExists())
    }
    const isStrongPassword = checkPasswordStrong(password)

    if (!isStrongPassword.isValid) {
      throw new WeakPasswordError(isStrongPassword.errors)
    }

    // Após validações, criar entidades (sem persistir ainda)
    const hashedPassword = await this.hashGenerator.hash(password)

    const userAddress = Address.create(address)

    let professional: Professional | undefined = undefined
    let client: Client | undefined = undefined

    if (role === 'PROFESSIONAL') {
      professional = Professional.create({
        sessionPrice: professionalData?.sessionPrice ?? 0,
        notificationSettings: professionalData?.notificationSettings,
      })
    }

    if (role === 'CLIENT') {
      client = Client.create({
        appointmentHistory: [],
        extraPreferences: clientData?.extraPreferences,
        periodPreference: clientData?.periodPreference,
      })
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

    // Persistir todas as entidades de uma vez dentro do try/catch
    try {
      await this.addressRepository.create(userAddress)

      if (professional) {
        await this.professionalRepository.create(professional)
      }

      if (client) {
        await this.clientRepository.create(client)
      }

      await this.userRepository.create(user)
    } catch (error: any) {
      // Tratamento para erro P2002 - Unique constraint violation
      if (error.code === 'P2002') {
        if (error.meta?.constraint?.fields?.includes('phone')) {
          return left(new PhoneAlreadyExistsError())
        }
        if (error.meta?.constraint?.fields?.includes('email')) {
          return left(new UserAlreadyExists())
        }
        if (error.meta?.constraint?.fields?.includes('cpf')) {
          return left(new CpfAlreadyExists())
        }
      }
      throw error
    }

    return right({ user })
  }
}
