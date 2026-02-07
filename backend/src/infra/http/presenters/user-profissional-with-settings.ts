import { UserProfessionalWithSettings } from '@/domain/scheduling/enterprise/entities/value-objects/user-professional-with-settings'

export class UserProfessionalWithSettingsPresenter {
  static toHTTP(userProfessional: UserProfessionalWithSettings) {
    return {
      id: userProfessional.id.toString(),
      user: {
        name: userProfessional.name,
        email: userProfessional.email,
        whatsappNumber: userProfessional.whatsappNumber,
      },
      professional: {
        sessionPrice: userProfessional.sessionPrice,
      },
      organization: userProfessional.organization
        ? {
            name: userProfessional.organization.name,
            cnpj: userProfessional.organization.cnpj,
          }
        : {},
      settings: {
        preferences: userProfessional.scheduleConfiguration,
        cancellationPolicy: userProfessional.cancellationPolicy,
      },
      googleCalendarTokens: userProfessional.googleCalendarTokens
        ? {
            id: userProfessional.googleCalendarTokens.id.toString(),
            googleAccountEmail:
              userProfessional.googleCalendarTokens.googleAccountEmail,
            scope: userProfessional.googleCalendarTokens.scope,
            createdAt: userProfessional.googleCalendarTokens.createdAt,
            updatedAt: userProfessional.googleCalendarTokens.updatedAt,
          }
        : null,
      createdAt: userProfessional.createdAt,
      updatedAt: userProfessional.updatedAt,
    }
  }
}
