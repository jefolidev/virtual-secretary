import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemorySendNotificationRepository } from '@test/repositories/in-memory-send-notification.repository'
import type { MockInstance } from 'vitest'
import { beforeEach, describe, it, vi } from 'vitest'
import {
  SendNotificationUseCase,
  type SendNotificationUseCaseRequest,
  type SendNotificationUseCaseResponse,
} from '../use-cases/send-notification'
import { OnAppointmentCanceled } from './on-appointment-canceled'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemorySendNotificationRepository: InMemorySendNotificationRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  (
    request: SendNotificationUseCaseRequest
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On Appointment Canceled', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemorySendNotificationRepository =
      new InMemorySendNotificationRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemorySendNotificationRepository
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnAppointmentCanceled(
      inMemoryProfessionalRepository,
      inMemoryClientRepository,
      sendNotificationUseCase
    )
  })

  it('should send a notification when appointment be canceled', async () => {
    const professional = makeProfessional()
    const client = makeClient()

    await inMemoryProfessionalRepository.create(professional)
    await inMemoryClientRepository.create(client)

    const appointment = makeAppointment({
      clientId: client.id,
      professionalId: professional.id,
    })

    await inMemoryAppointmentRepository.create(appointment)

    appointment.cancel()

    inMemoryAppointmentRepository.save(appointment)

    await vi.waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
