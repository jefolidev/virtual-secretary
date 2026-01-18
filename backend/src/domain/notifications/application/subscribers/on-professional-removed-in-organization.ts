import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { RemovedProfessionalFromOrganizationEvent } from '@/domain/organization/enterprise/events/remove-professional-organization'
import { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'
import { Injectable } from '@nestjs/common'
import { SendNotificationUseCase } from '../use-cases/send-notification'

@Injectable()
export class OnProfessionalRemovedFromOrganization implements EventHandler {
  constructor(
    private sendNotification: SendNotificationUseCase,
    private professionalRepository: ProfessionalRepository,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendRemovalNotification.bind(this),
      RemovedProfessionalFromOrganizationEvent.name,
    )
  }

  private async sendRemovalNotification(
    event: RemovedProfessionalFromOrganizationEvent,
  ) {
    const professional = await this.professionalRepository.findById(
      event.professionalId.toString(),
    )

    if (professional) {
      await this.sendNotification.execute({
        recipientId: professional.id.toString(),
        title: `Você foi removido da ${event.organizationName}`,
        content: `Você não faz mais parte da organização ${event.organizationName}.`,
        reminderType: 'REMOVAL',
      })
    }
  }
}
