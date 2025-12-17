import { UserProfessionalWithSettings } from '@/domain/scheduling/enterprise/entities/value-objects/user-professional-with-settings'

export class UserProfessionalWithSettingsPresenter {
  static toHTTP(userProfessional: UserProfessionalWithSettings) {
    return {
      id: userProfessional.id.toString(),
      user: {
        name: userProfessional.name,
        email: userProfessional.email,
        phone: userProfessional.phone,
      },
      professional: {
        session_price: userProfessional.sessionPrice,
      },
      organization: userProfessional.organization
        ? {
            name: userProfessional.organization.name,
            cnpj: userProfessional.organization.cnpj,
          }
        : {},
      settings: {
        preferences: userProfessional.scheduleConfiguration,
        cancellation_policy: userProfessional.cancellationPolicy,
      },
      created_at: userProfessional.createdAt,
      updated_at: userProfessional.updatedAt,
    }
  }
}
