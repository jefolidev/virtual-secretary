import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UserProfessionalWithSettings } from '../../enterprise/entities/value-objects/user-professional-with-settings'
import { ProfessionalRepository } from '../repositories/professional.repository'

export interface FetchProfessionalUseCasePropsRequest {
  page?: number
}

export type FetchProfessionalUseCaseResponse = Either<
  null,
  { professionals: UserProfessionalWithSettings[] }
>

@Injectable()
export class FetchProfessionalUseCase {
  constructor(private professionalRepository: ProfessionalRepository) {}

  async execute({
    page = 1,
  }: FetchProfessionalUseCasePropsRequest): Promise<FetchProfessionalUseCaseResponse> {
    const professionals =
      await this.professionalRepository.findManyProfessionalsAndSettings({
        page,
      })

    return right({
      professionals: professionals || [],
    })
  }
}
