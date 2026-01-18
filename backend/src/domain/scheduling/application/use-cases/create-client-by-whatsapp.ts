import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'
import { Address, AddressProps } from '../../enterprise/entities/address'
import { Client } from '../../enterprise/entities/client'
import { User } from '../../enterprise/entities/user'
import { HashGenerator } from '../cryptography/hash-generator'
import { AddressRepository } from '../repositories/address.repository'
import { ClientRepository } from '../repositories/client.repository'
import { UserRepository } from '../repositories/user.repository'
import { ThreadGenerator } from '../webhook/openai/thread-generator'
import { CpfAlreadyExists } from './errors/cpf-already-exists'
import { UserAlreadyExists } from './errors/user-already-exists'
import { UserAreProfessionalError } from './errors/user-are-professional'
import { ValidationError } from './errors/validation-error'

export interface CreateClientByWhatsappUseCaseProps {
  name: string
  email: string
  whatsappNumber: string
  cpf: string
  gender: 'MALE' | 'FEMALE'
  birthDate: Date
  address: AddressProps
  clientData: {
    periodPreference: ('MORNING' | 'AFTERNOON' | 'EVENING')[]
    extraPreferences?: string
  }
}

type CreateClientByWhatsappUseCaseResponse = Either<
  UserAlreadyExists | CpfAlreadyExists | ValidationError,
  { threadId: string }
>

@Injectable()
export class CreateClientByWhatsappUseCase {
  constructor(
    private readonly clientsRepository: ClientRepository,
    private readonly addressRepository: AddressRepository,
    private readonly usersRepository: UserRepository,
    private readonly hashGenerator: HashGenerator,
    private readonly thread: ThreadGenerator,
  ) {}

  async execute({
    name,
    email,
    whatsappNumber,
    cpf,
    gender,
    birthDate,
    address,
    clientData,
  }: CreateClientByWhatsappUseCaseProps): Promise<CreateClientByWhatsappUseCaseResponse> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      if (
        userWithSameEmail.role === 'PROFESSIONAL' ||
        userWithSameEmail.professionalId
      ) {
        return left(new UserAreProfessionalError())
      }

      return left(new UserAlreadyExists())
    }

    const userWithSameCpf = await this.usersRepository.findByCpf(cpf)

    if (userWithSameCpf) {
      if (
        userWithSameCpf.role === 'PROFESSIONAL' ||
        userWithSameCpf.professionalId
      ) {
        return left(new UserAreProfessionalError())
      }
      return left(new CpfAlreadyExists())
    }

    const userWithSamePhone =
      await this.usersRepository.findByPhone(whatsappNumber)

    if (userWithSamePhone) {
      if (
        userWithSamePhone.role === 'PROFESSIONAL' ||
        userWithSamePhone.professionalId
      ) {
        return left(new UserAreProfessionalError())
      }
      return left(new ValidationError('Whatsapp number already exists'))
    }

    const { periodPreference, extraPreferences } = clientData

    const generateRandomPassword = (): string => {
      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    const randomPassword = generateRandomPassword()
    const hashedPassword = await this.hashGenerator.hash(randomPassword)

    const threadId = await this.thread.create()

    const userAddress = Address.create(address)

    await this.addressRepository.create(userAddress)

    const client = Client.create({
      extraPreferences,
      periodPreference,
      appointmentHistory: [],
    })

    await this.clientsRepository.create(client)

    const user = User.create({
      name,
      email,
      password: hashedPassword,
      whatsappNumber,
      cpf,
      gender,
      birthDate,
      addressId: userAddress.id,
      threadId: new UniqueEntityId(threadId),
      clientId: client.id,
      professionalId: undefined,
      role: 'CLIENT',
    })

    await this.usersRepository.create(user)

    return right({ threadId: user.threadId!.toString() })
  }
}
