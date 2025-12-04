import { Either, right } from '@/core/either'
import type { Professional } from '../../enterprise/entities/professional'
import type { ProfessionalRepository } from '../repositories/professional-repository'

export type FetchProfessionalUseCaseProps = Record<string, never>

export type FetchProfessionalUseCaseResponse = Either<
  null,
  { professionals: Professional[] }
>

export class FetchProfessionalUseCase {
  constructor(private professionalRepository: ProfessionalRepository) {}

  async execute(
    _: FetchProfessionalUseCaseProps
  ): Promise<FetchProfessionalUseCaseResponse> {
    const professionals = await this.professionalRepository.findMany()

    return right({
      professionals,
    })
  }
}
