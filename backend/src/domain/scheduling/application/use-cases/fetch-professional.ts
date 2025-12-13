import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Professional } from '../../enterprise/entities/professional'
import { ProfessionalRepository } from '../repositories/professional.repository'

export interface FetchProfessionalUseCasePropsRequest {
  page?: number
}

export type FetchProfessionalUseCaseResponse = Either<
  null,
  { professionals: Professional[] }
>

@Injectable()
export class FetchProfessionalUseCase {
  constructor(private professionalRepository: ProfessionalRepository) {}

  async execute({
    page = 1,
  }: FetchProfessionalUseCasePropsRequest): Promise<FetchProfessionalUseCaseResponse> {
    const professionals = await this.professionalRepository.findMany({ page })

    return right({
      professionals,
    })
  }
}
