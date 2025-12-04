import type { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'

export abstract class CancellationPolicyRepository {
  abstract create(cancellationPolicy: CancellationPolicy): Promise<void>
  abstract findById(id: string): Promise<CancellationPolicy | null>
  abstract findByProfessionalId(
    professionalId: string
  ): Promise<CancellationPolicy | null>
  abstract save(cancellationPolicy: CancellationPolicy): Promise<void>
}
