import { Professional } from '@/domain/scheduling/enterprise/entities/professional'

export class ProfessionalsPresenter {
  static toHTTP(professional: Professional) {
    return {
      id: professional.id.toString(),
      sessionPrice: professional.sessionPrice,
      createdAt: professional.createdAt,
      updatedAt: professional.updatedAt,
    }
  }
}
