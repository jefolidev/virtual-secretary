import { HashGenerator } from '@/domain/scheduling/application/cryptography/hash-generator'
import {
  CookieClearOptions,
  UserRepository,
} from '@/domain/scheduling/application/repositories/user.repository'
import { Address } from '@/domain/scheduling/enterprise/entities/address'
import { Client } from '@/domain/scheduling/enterprise/entities/client'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { UserClientWhatsappAppointments } from '@/domain/scheduling/enterprise/entities/value-objects/user-with-clients-and-appointments'
import { WhatsappContact } from '@/domain/scheduling/enterprise/entities/whatsapp-contact'
import { Injectable } from '@nestjs/common'
import cep from 'cep-promise'
import { PrismaAddressMapper } from '../../mappers/prisma-address-mapper'
import { PrismaClientMapper } from '../../mappers/prisma-client-mapper'
import { PrismaUserMapper } from '../../mappers/prisma-user-mapper'
import { PrismaUserWithWhatsappAndAppointmentMapper } from '../../mappers/prisma-user-with-whatsapp-and-appointment-mapper'
import { PrismaWhatsappContactMapper } from '../../mappers/prisma-whatsapp-contact-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async fetchWhatsappRegisteredAndUnlinked(): Promise<{
    registred: UserClientWhatsappAppointments[]
    unlinked: WhatsappContact[]
  } | null> {
    const registred = await this.prisma.user.findMany({
      where: {
        whatsappNumber: {
          not: undefined,
        },
      },
      include: {
        client: {
          include: {
            appointments: true,
          },
        },
        whatsappContact: true,
      },
    })

    const contacts = await this.prisma.whatsappContact.findMany({
      where: {
        userId: null,
        phone: {
          not: undefined,
        },
      },
    })

    if (
      (!registred || registred.length === 0) &&
      (!contacts || contacts.length === 0)
    ) {
      return null
    }

    return {
      registred: registred.map(
        PrismaUserWithWhatsappAndAppointmentMapper.toDomain,
      ),
      unlinked: contacts.map(PrismaWhatsappContactMapper.toDomain),
    }
  }

  async findManyUsersWithWhatsApp(): Promise<
    UserClientWhatsappAppointments[] | null
  > {
    const users = await this.prisma.user.findMany({
      where: {
        whatsappNumber: {
          not: undefined,
        },
      },
      include: {
        client: {
          include: {
            appointments: true,
          },
        },
        whatsappContact: true,
      },
    })

    if (!users || users.length === 0) {
      return null
    }

    return users.map((user) =>
      PrismaUserWithWhatsappAndAppointmentMapper.toDomain(user),
    )
  }

  clearAuthCookies({ response, request }: CookieClearOptions): void {
    const cookiesToClear = ['access_token', 'user_data', 'authToken']
    const isProduction = process.env.NODE_ENV === 'production'

    cookiesToClear.forEach((cookieName) => {
      response.clearCookie(cookieName, { path: '/' })
      response.clearCookie(cookieName, {
        path: '/',
        domain: request.hostname,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
      })
    })
  }

  async findManyProfessionalUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        professionalId: {
          not: null,
        },
      },
      include: {
        address: true,

        professional: {
          include: {
            cancellationPolicy: true,
            scheduleConfiguration: true,
            organization: true,
          },
        },
      },
    })

    return users.map(PrismaUserMapper.toDomain)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        address: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async findByClientId(clientId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        clientId,
      },
      include: {
        address: true,
        client: true,
      },
    })

    if (!user || !user.client) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }
  async findManyClientUsers(): Promise<User[] | null> {
    const users = await this.prisma.user.findMany({
      where: {
        clientId: {
          not: null,
        },
      },
      include: {
        address: true,
        client: true,
      },
    })

    if (!users) {
      return null
    }

    return users.map(PrismaUserMapper.toDomain)
  }

  async findByProfessionalId(professionalId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        professionalId,
      },
      include: {
        address: true,
        professional: true,
      },
    })

    if (!user || !user.professional) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async getThreadId(
    whatsappNumber: string,
  ): Promise<string | null | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        whatsappNumber,
      },
      select: {
        threadId: true,
      },
    })

    if (!user) {
      return null
    }

    return user.threadId ?? undefined
  }

  async findByPhone(whatsappNumber: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        whatsappNumber,
      },
      include: {
        client: true,
        address: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        cpf,
      },
      include: {
        address: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async resetPassword(userId: string, password: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
      },
    })
  }

  async create(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await this.prisma.user.create({
      data,
    })
  }

  async createClientByWhatsapp(data: {
    name: string
    email: string
    whatsappNumber: string
    cpf: string
    gender: 'MALE' | 'FEMALE'
    birthDate: Date
    extraPreferences: string
    periodPreference: ('MORNING' | 'AFTERNOON' | 'EVENING')[]
    complement: string | null
    cep: string
    number: string
  }): Promise<User> {
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

    const {
      cep: cepValue,
      street,
      city,
      state,
      neighborhood,
    } = await cep(data.cep)

    const addressData = Address.create({
      postalCode: cepValue,
      addressLine1: street + (data.number ? `, ${data.number}` : ''),
      addressLine2: data.complement,
      city,
      state,
      country: 'Brasil',
      neighborhood,
    })

    await this.prisma.address.create({
      data: PrismaAddressMapper.toPrisma(addressData),
    })

    const client = Client.create({
      appointmentHistory: [],
      periodPreference: data.periodPreference,
      extraPreferences: data.extraPreferences || '',
    })

    await this.prisma.client.create({
      data: PrismaClientMapper.toPrisma(client),
    })

    const user: User = User.create({
      name: data.name,
      email: data.email,
      whatsappNumber: data.whatsappNumber,
      cpf: data.cpf,
      gender: data.gender,
      birthDate: data.birthDate,
      password: hashedPassword,
      professionalId: undefined,
      addressId: addressData.id,
      role: 'CLIENT',
      clientId: client.id,
    })

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    })

    return user
  }

  async save(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await this.prisma.user.update({
      where: {
        id: user.id.toString(),
      },
      data,
    })
  }
}
