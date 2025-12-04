import { makeOrganization } from '@test/factories/make-organization'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryOrganizationRepository } from '@test/repositories/in-memory-organization.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemorySendNotificationRepository } from '@test/repositories/in-memory-send-notification.repository'
import type { MockInstance } from 'vitest'
import {
  SendNotificationUseCase,
  type SendNotificationUseCaseRequest,
  type SendNotificationUseCaseResponse,
} from '../use-cases/send-notification'
import { OnProfessionalRemovedFromOrganization } from './on-professional-removed-in-organization'

let inMemoryOrganizationRepository: InMemoryOrganizationRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemorySendNotificationRepository: InMemorySendNotificationRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  (
    request: SendNotificationUseCaseRequest
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On Professional Remove In Organization', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository()
    inMemorySendNotificationRepository =
      new InMemorySendNotificationRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemorySendNotificationRepository
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnProfessionalRemovedFromOrganization(
      sendNotificationUseCase,
      inMemoryProfessionalRepository
    )
  })

  it('should send a notification when professional removed in some organization', async () => {
    const organization = makeOrganization({
      name: 'Clinica Saúde Total',
    })
    const professional = makeProfessional({
      name: 'Dr. João Silva',
    })

    await inMemoryOrganizationRepository.create(organization)
    await inMemoryProfessionalRepository.create(professional)

    organization.removeProfessional(professional.id)

    await inMemoryOrganizationRepository.save(organization)

    await vi.waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })

    expect(sendNotificationExecuteSpy).toHaveBeenCalledWith({
      recipientId: professional.id.toString(),
      title: `Você foi removido da ${organization.name}`,
      content: `Você não faz mais parte da organização ${organization.name}.`,
    })
  })
})
