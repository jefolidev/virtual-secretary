import { Address } from '@/domain/scheduling/enterprise/entities/address'
import { CancellationPolicy } from '@/domain/scheduling/enterprise/entities/cancellation-policy'
import { Professional } from '@/domain/scheduling/enterprise/entities/professional'
import { ScheduleConfiguration } from '@/domain/scheduling/enterprise/entities/schedule-configuration'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { NotificationSettings } from '@/domain/scheduling/enterprise/entities/value-objects/notification-settings'
import { WorkingDaysList } from '@/domain/scheduling/enterprise/entities/value-objects/working-days-list'
import { UniqueEntityId } from '../entities/unique-entity-id'

// Função auxiliar para criar um profissional completo
const createCompleteProfessional = (
  userData: {
    name: string
    email: string
    sessionPrice: number
    whatsappNumber: string
    gender: 'MALE' | 'FEMALE'
    birthDate: Date
    cpf: string
  },
  addressData: {
    addressLine1: string
    city: string
    state: string
    postalCode: string
    neighborhood: string
  },
  config: {
    appointmentLeadTimeInHours: number
    cancellationLeadTimeInHours: number
    workingDays: number[]
  },
): {
  user: User
  professional: Professional
  address: Address
  notificationSettings: NotificationSettings
  cancellationPolicy: CancellationPolicy
  scheduleConfiguration: ScheduleConfiguration
} => {
  const userId = new UniqueEntityId()
  const professionalId = new UniqueEntityId()
  const addressId = new UniqueEntityId()

  const user = User.create(
    {
      name: userData.name,
      email: userData.email,
      role: 'PROFESSIONAL',
      password: 'hashed_password', // Senha padrão para mocks
      cpf: userData.cpf,
      gender: userData.gender,
      birthDate: userData.birthDate,
      professionalId: professionalId, // Vincula o User ao Professional
      addressId: addressId, // Vincula o User ao Address
      whatsappNumber: userData.whatsappNumber,
      clientId: undefined,
    },
    userId,
  )

  const professional = Professional.create(
    {
      userId: userId,
      sessionPrice: userData.sessionPrice,
    },
    professionalId,
  )

  const address = Address.create(
    {
      addressLine1: addressData.addressLine1,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: 'Brasil',
      neighborhood: addressData.neighborhood,
    },
    addressId,
  )

  const notificationSettings = NotificationSettings.create({
    dailySummaryTime: '08:00',
    enabledTypes: [
      'CONFIRMATION',
      'DAILY_SUMMARY',
      'CANCELLATION',
      'CONFIRMED_LIST',
      'NEW_APPOINTMENT',
    ],
    reminderBeforeMinutes: 20,
  })

  const cancellationPolicy = CancellationPolicy.create({
    professionalId: professionalId,
    cancelationFeePercentage: 20,
    allowReschedule: true,
    description: '',
    minDaysBeforeNextAppointment: 2,
    minHoursBeforeCancellation: 2,
  })

  const scheduleConfiguration = ScheduleConfiguration.create({
    professionalId: professionalId,
    enableGoogleMeet: true,
    holidays: [],
    workingHours: {
      start: '08:00',
      end: '18:00',
    },

    workingDays: new WorkingDaysList(config.workingDays), // Corrigido
  })

  return {
    user,
    professional,
    address,
    notificationSettings,
    cancellationPolicy,
    scheduleConfiguration,
  }
}

// Lista de profissionais mockados
export const mockCompleteProfessionals = [
  createCompleteProfessional(
    {
      name: 'Dr. Ana Beatriz Barbosa',
      email: 'ana.barbosa@mindai.com',
      gender: 'FEMALE',
      birthDate: new Date('1980-05-15'),
      cpf: '111.111.111-11',
      sessionPrice: 150,
      whatsappNumber: '+5511999999999',
    },
    {
      addressLine1: 'Rua das Flores',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01000-000',
      neighborhood: 'Jardim das Acácias',
    },
    {
      appointmentLeadTimeInHours: 24,
      cancellationLeadTimeInHours: 48,
      workingDays: [1, 2, 3, 4, 5],
    },
  ),
  createCompleteProfessional(
    {
      name: 'Dr. Carlos Drummond',
      email: 'carlos.drummond@mindai.com',
      gender: 'MALE',
      birthDate: new Date('1975-11-20'),
      cpf: '222.222.222-22',
      sessionPrice: 200,
      whatsappNumber: '+5511988888888',
    },
    {
      addressLine1: 'Avenida Principal',
      city: 'Rio de Janeiro',
      state: 'RJ',
      postalCode: '20000-000',
      neighborhood: 'Centro ',
    },
    {
      appointmentLeadTimeInHours: 12,
      cancellationLeadTimeInHours: 24,
      workingDays: [1, 3, 5],
    },
  ),
  createCompleteProfessional(
    {
      name: 'Dra. Lúcia Helena Galvão',
      email: 'lucia.galvao@mindai.com',
      gender: 'FEMALE',
      birthDate: new Date('1982-02-10'),
      cpf: '333.333.333-33',
      sessionPrice: 180,
      whatsappNumber: '+5511977777777',
    },
    {
      addressLine1: 'Praça da Sé',
      city: 'Salvador',
      state: 'BA',
      postalCode: '40000-000',
      neighborhood: 'Centro',
    },
    {
      appointmentLeadTimeInHours: 48,
      cancellationLeadTimeInHours: 72,
      workingDays: [2, 4],
    },
  ),
  createCompleteProfessional(
    {
      name: 'Dr. Mário Sérgio Cortella',
      email: 'mario.cortella@mindai.com',
      gender: 'MALE',
      birthDate: new Date('1968-09-05'),
      cpf: '444.444.444-44',
      sessionPrice: 220,
      whatsappNumber: '+5511966666666',
    },
    {
      addressLine1: 'Rua dos Andradas',
      city: 'Porto Alegre',
      state: 'RS',
      postalCode: '90000-000',
      neighborhood: 'Centro',
    },
    {
      appointmentLeadTimeInHours: 6,
      cancellationLeadTimeInHours: 12,
      workingDays: [1, 2, 3, 4, 5, 6],
    },
  ),
  createCompleteProfessional(
    {
      name: 'Dra. Sofia Bauer',
      email: 'sofia.bauer@mindai.com',
      gender: 'FEMALE',
      birthDate: new Date('1985-07-22'),
      cpf: '555.555.555-55',
      sessionPrice: 190,
      whatsappNumber: '+5511955555555',
    },
    {
      addressLine1: 'Avenida Afonso Pena',
      city: 'Belo Horizonte',
      state: 'MG',
      postalCode: '30000-000',
      neighborhood: 'Centro',
    },
    {
      appointmentLeadTimeInHours: 24,
      cancellationLeadTimeInHours: 48,
      workingDays: [1, 2, 3, 4],
    },
  ),
  createCompleteProfessional(
    {
      name: 'Dr. Augusto Cury',
      email: 'augusto.cury@mindai.com',
      gender: 'MALE',
      birthDate: new Date('1972-03-30'),
      cpf: '666.666.666-66',
      sessionPrice: 210,
      whatsappNumber: '+5511944444444',
    },
    {
      addressLine1: 'Rua da Consolação',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01301-000',
      neighborhood: 'Consolação',
    },
    {
      appointmentLeadTimeInHours: 24,
      cancellationLeadTimeInHours: 24,
      workingDays: [1, 2, 3, 4, 5],
    },
  ),
  createCompleteProfessional(
    {
      name: 'Dra. Cecília Meireles',
      email: 'cecilia.meireles@mindai.com',
      gender: 'FEMALE',
      birthDate: new Date('1988-12-01'),
      cpf: '777.777.777-77',
      sessionPrice: 160,
      whatsappNumber: '+5511933333333',
    },
    {
      addressLine1: 'Avenida Beira Mar',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      neighborhood: 'Centro',
    },
    {
      appointmentLeadTimeInHours: 48,
      cancellationLeadTimeInHours: 48,
      workingDays: [3, 4, 5],
    },
  ),
  createCompleteProfessional(
    {
      name: 'Dr. Pedro Calabrez',
      email: 'pedro.calabrez@mindai.com',
      gender: 'MALE',
      birthDate: new Date('1983-06-18'),
      cpf: '888.888.888-88',
      sessionPrice: 175,
      whatsappNumber: '+5511922222222',
    },
    {
      addressLine1: 'Esplanada dos Ministérios',
      city: 'Brasília',
      state: 'DF',
      postalCode: '70000-000',
      neighborhood: 'Centro',
    },
    {
      appointmentLeadTimeInHours: 12,
      cancellationLeadTimeInHours: 24,
      workingDays: [1, 2, 5, 6],
    },
  ),
]
