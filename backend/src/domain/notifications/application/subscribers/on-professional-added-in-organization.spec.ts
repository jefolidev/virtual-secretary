import { makeOrganization } from '@test/factories/make-organization'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryOrganizationRepository } from '@test/repositories/in-memory-organization.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemorySendNotificationRepository } from '@test/repositories/in-memory-send-notification.repository'
import type { MockInstance } from 'vitest'
import { beforeEach, describe, it, vi } from 'vitest'
import {
  SendNotificationUseCase,
  type SendNotificationUseCaseRequest,
  type SendNotificationUseCaseResponse,
} from '../use-cases/send-notification'
import { OnProfessionalAddedToOrganization } from './on-professional-added-in-organization'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemorySendNotificationRepository: InMemorySendNotificationRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  (
    request: SendNotificationUseCaseRequest
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On Professional Added In Organization', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    inMemorySendNotificationRepository =
      new InMemorySendNotificationRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemorySendNotificationRepository
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnProfessionalAddedToOrganization(
      sendNotificationUseCase,
      inMemoryProfessionalRepository
    )
  })

  it('should send a notification when professional added in some organization', async () => {
    const organization = makeOrganization({
      name: 'Clinica Saúde Total',
    })
    const professional = makeProfessional({
      name: 'Dr. João Silva',
    })

    await inMemoryOrganizationRepository.create(organization)
    await inMemoryProfessionalRepository.create(professional)

    organization.addProfessional(professional.id)

    await inMemoryOrganizationRepository.save(organization)

    await vi.waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })

    expect(sendNotificationExecuteSpy).toHaveBeenCalledWith({
      recipientId: professional.id.toString(),
      title: `Bem-vindo à ${organization.name}!`,
      content: `Você foi adicionado à organização ${organization.name}. Agora você pode receber agendamentos.`,
    })
  })
})
