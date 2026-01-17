import { Either, left, right } from '@/core/either'
import { checkPasswordStrong } from '@/utils/checkPasswordStrong'
import { Injectable } from '@nestjs/common'
import { Address, AddressProps } from '../../enterprise/entities/address'
import { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'
import { Client } from '../../enterprise/entities/client'
import { Professional } from '../../enterprise/entities/professional'
import { ScheduleConfiguration } from '../../enterprise/entities/schedule-configuration'
import { User } from '../../enterprise/entities/user'
import { NotificationSettings } from '../../enterprise/entities/value-objects/notification-settings'
import { WorkingDaysList } from '../../enterprise/entities/value-objects/working-days-list'
import { HashGenerator } from '../cryptography/hash-generator'
import { AddressRepository } from '../repositories/address.repository'
import { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository'
import { ClientRepository } from '../repositories/client.repository'
import { ProfessionalRepository } from '../repositories/professional.repository'
import { ScheduleConfigurationRepository } from '../repositories/schedule-configuration.repository'
import { UserRepository } from '../repositories/user.repository'
import { CpfAlreadyExists } from './errors/cpf-already-exists'
import { UserAlreadyExists } from './errors/user-already-exists'
import { ValidationError } from './errors/validation-error'
import { WeakPasswordError } from './errors/weak-password-error'
import { PhoneAlreadyExistsError } from './errors/whatsappNumber-already-exists'

interface RegisterUserUseCaseRequest {
  name: string
  email: string
  password: string
  whatsappNumber: string
  cpf: string
  gender: 'MALE' | 'FEMALE'
  birthDate: Date
  address: AddressProps
  professionalData?: {
    sessionPrice: number
    notificationSettings?: NotificationSettings
    cancellationPolicy?: {
      minHoursBeforeCancellation: number
      minDaysBeforeNextAppointment: number
      cancelationFeePercentage: number
      allowReschedule: boolean
      description?: string
    }
    scheduleConfiguration?: {
      bufferIntervalMinutes: number
      daysOfWeek: number[]
      startTime: string
      endTime: string
      holidays: string[]
      sessionDurationMinutes: number
    }
  }
  clientData?: {
    periodPreference: ('MORNING' | 'AFTERNOON' | 'EVENING')[]
    extraPreferences?: string
  }
  role: 'PROFESSIONAL' | 'CLIENT'
}

type RegisterUserUseCaseResponse = Either<
  | UserAlreadyExists
  | PhoneAlreadyExistsError
  | CpfAlreadyExists
  | ValidationError,
  { user: User }
>

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashGenerator: HashGenerator,
    private readonly clientRepository: ClientRepository,
    private readonly professionalRepository: ProfessionalRepository,
    private readonly addressRepository: AddressRepository,
    private readonly cancellationPolicyRepository: CancellationPolicyRepository,
    private readonly scheduleConfigurationRepository: ScheduleConfigurationRepository,
  ) {}

  async execute({
    name,
    email,
    password,
    whatsappNumber,
    cpf,
    gender,
    birthDate,
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

    const userWithSamePhone =
      await this.userRepository.findByPhone(whatsappNumber)

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
    let cancellationPolicy: CancellationPolicy | undefined = undefined
    let scheduleConfiguration: ScheduleConfiguration | undefined = undefined

    if (role === 'PROFESSIONAL') {
      professional = Professional.create({
        sessionPrice: professionalData?.sessionPrice ?? 0,
        notificationSettings: professionalData?.notificationSettings,
      })

      // Criar política de cancelamento se fornecida
      if (professionalData?.cancellationPolicy) {
        const policyData = professionalData.cancellationPolicy
        cancellationPolicy = CancellationPolicy.create({
          professionalId: professional.id,
          minHoursBeforeCancellation: policyData.minHoursBeforeCancellation,
          minDaysBeforeNextAppointment: policyData.minDaysBeforeNextAppointment,
          cancelationFeePercentage: policyData.cancelationFeePercentage,
          allowReschedule: policyData.allowReschedule,
          description: policyData.description || '',
        })
        professional.cancellationPolicyId = cancellationPolicy.id
      }

      // Criar configuração de horários se fornecida
      if (professionalData?.scheduleConfiguration) {
        const configData = professionalData.scheduleConfiguration
        scheduleConfiguration = ScheduleConfiguration.create({
          professionalId: professional.id,
          bufferIntervalMinutes: configData.bufferIntervalMinutes,
          workingDays: new WorkingDaysList(configData.daysOfWeek),
          workingHours: {
            start: configData.startTime,
            end: configData.endTime,
          },
          holidays: configData.holidays.map((holiday) => new Date(holiday)),
          sessionDurationMinutes: configData.sessionDurationMinutes,
          enableGoogleMeet: false,
        })
        professional.scheduleConfigurationId = scheduleConfiguration.id
      }
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
      gender,
      birthDate,
      role,
      whatsappNumber,
      professionalId: professional?.id,
      clientId: client?.id,
    })

    // Validações prévias rigorosas para evitar dados órfãos
    if (role === 'PROFESSIONAL') {
      if (professionalData?.cancellationPolicy) {
        const policy = professionalData.cancellationPolicy
        if (policy.minHoursBeforeCancellation < 6) {
          return left(
            new ValidationError(
              'Política: mínimo de 6 horas para cancelamento',
            ),
          )
        }
        if (policy.minDaysBeforeNextAppointment < 1) {
          return left(
            new ValidationError(
              'Política: mínimo de 1 dia para próximo agendamento',
            ),
          )
        }
        if (
          policy.cancelationFeePercentage < 0 ||
          policy.cancelationFeePercentage > 100
        ) {
          return left(
            new ValidationError('Política: taxa deve estar entre 0 e 100%'),
          )
        }
      }

      if (professionalData?.scheduleConfiguration) {
        const config = professionalData.scheduleConfiguration
        if (!config.daysOfWeek || config.daysOfWeek.length === 0) {
          return left(
            new ValidationError(
              'Configuração: pelo menos um dia da semana obrigatório',
            ),
          )
        }
        if (!config.startTime || !config.endTime) {
          return left(
            new ValidationError(
              'Configuração: horários de início e fim obrigatórios',
            ),
          )
        }
        if (config.sessionDurationMinutes < 1) {
          return left(
            new ValidationError(
              'Configuração: duração da sessão deve ser maior que 0',
            ),
          )
        }
      }
    }

    // Após todas as validações, persistir usando repositories existentes
    try {
      await this.addressRepository.create(userAddress)

      // Criar profissional PRIMEIRO (para que as foreign keys funcionem)
      if (professional) {
        await this.professionalRepository.create(professional)
      }

      // Agora criar as entidades que dependem do profissional
      if (cancellationPolicy) {
        await this.cancellationPolicyRepository.create(cancellationPolicy)
      }

      if (scheduleConfiguration) {
        await this.scheduleConfigurationRepository.create(scheduleConfiguration)
      }

      if (client) {
        await this.clientRepository.create(client)
      }

      await this.userRepository.create(user)
    } catch (error: any) {
      // Tratamento para erro P2002 - Unique constraint violation
      if (error.code === 'P2002') {
        if (error.meta?.constraint?.fields?.includes('whatsappNumber')) {
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
