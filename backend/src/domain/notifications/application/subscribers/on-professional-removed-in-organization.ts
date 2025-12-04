import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { RemovedProfessionalFromOrganizationEvent } from '@/domain/organization/enterprise/events/remove-professional-organization'
import type { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional-repository'
import type { SendNotificationUseCase } from '../use-cases/send-notification'

export class OnProfessionalRemovedFromOrganization implements EventHandler {
  constructor(
    private sendNotification: SendNotificationUseCase,
    private professionalRepository: ProfessionalRepository
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendRemovalNotification.bind(this),
      RemovedProfessionalFromOrganizationEvent.name
    )
  }

  private async sendRemovalNotification(
    event: RemovedProfessionalFromOrganizationEvent
  ) {
    const professional = await this.professionalRepository.findById(
      event.professionalId
    )

    if (professional) {
      await this.sendNotification.execute({
        recipientId: professional.id.toString(),
        title: `Você foi removido da ${event.organizationName}`,
        content: `Você não faz mais parte da organização ${event.organizationName}.`,
      })
    }
  }
}
