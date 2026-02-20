import { DomainEvents } from '@/core/events/domain-events'
import { User } from '@/domain/scheduling/enterprise/entities/user'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemorySendNotificationRepository } from '@test/repositories/in-memory-send-notification.repository'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import type { MockInstance } from 'vitest'
import { beforeEach, describe, it, vi } from 'vitest'
import {
  SendNotificationUseCase,
  type SendNotificationUseCaseRequest,
  type SendNotificationUseCaseResponse,
} from '../use-cases/send-notification'
import { OnAppointmentScheduled } from './on-appointment-scheduled'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryUserRepository: InMemoryUserRepository
let inMemorySendNotificationRepository: InMemorySendNotificationRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  (
    request: SendNotificationUseCaseRequest,
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On Appointment Scheduled', () => {
  afterEach(() => {
    // Se houver algum método para limpar eventos, chame aqui
    DomainEvents.clearHandlers() // ou similar, se existir
  })

  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryUserRepository = new InMemoryUserRepository()
    inMemorySendNotificationRepository =
      new InMemorySendNotificationRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemorySendNotificationRepository,
      inMemoryProfessionalRepository,
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnAppointmentScheduled(
      inMemoryProfessionalRepository,
      inMemoryClientRepository,
      inMemoryUserRepository,
      sendNotificationUseCase,
    )
  })

  it('should send a notification when appointment be scheduled', async () => {
    const userClient = User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      birthDate: new Date('1990-01-01'),
      password: 'hashed-password',
      cpf: '12345678900',
      gender: 'MALE',
      role: 'CLIENT',
      whatsappNumber: '11999999999',
    })
    const userProfessional = User.create({
      name: 'Dr. Smith',
      email: 'dr.smith@example.com',
      birthDate: new Date('1980-01-01'),
      password: 'hashed-password',
      cpf: '98765432100',
      gender: 'MALE',
      role: 'PROFESSIONAL',
      whatsappNumber: '11988888888',
    })

    await inMemoryUserRepository.create(userClient)
    await inMemoryUserRepository.create(userProfessional)

    const professional = makeProfessional({
      userId: userProfessional.id,
    })

    await inMemoryProfessionalRepository.create(professional)

    const client = makeClient({
      userId: userClient.id,
    })

    await inMemoryClientRepository.create(client)

    userClient.clientId = client.id
    userProfessional.professionalId = professional.id

    await inMemoryUserRepository.save(userClient)
    await inMemoryUserRepository.save(userProfessional)

    const appointment = makeAppointment({
      clientId: userClient.clientId,
      professionalId: professional.id,
    })

    await inMemoryAppointmentRepository.create(appointment)

    await vi.waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
