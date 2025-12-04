import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import type { SendNotificationUseCase } from '@/domain/notifications/application/use-cases/send-notification'
import { AddedProfessionalToOrganizationEvent } from '@/domain/organization/enterprise/events/added-professional-organization'
import type { ProfessionalRepository } from '@/domain/scheduling/application/repositories/professional.repository'

export class OnProfessionalAddedToOrganization implements EventHandler {
  constructor(
    private sendNotification: SendNotificationUseCase,
    private professionalRepo: ProfessionalRepository
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendWelcomeNotification.bind(this),
      AddedProfessionalToOrganizationEvent.name
    )
  }

  private async sendWelcomeNotification(
    event: AddedProfessionalToOrganizationEvent
  ) {
    const professional = await this.professionalRepo.findById(
      event.professionalId
    )

    if (professional) {
      await this.sendNotification.execute({
        recipientId: professional.id.toString(),
        title: `Bem-vindo à ${event.organizationName}!`,
        content: `Você foi adicionado à organização ${event.organizationName}. Agora você pode receber agendamentos.`,
      })
    }
  }
}
