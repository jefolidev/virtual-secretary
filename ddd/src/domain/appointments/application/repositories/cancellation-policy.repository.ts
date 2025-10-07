import type { CancellationPolicy } from '../../enterprise/entities/cancellation-policy'

export interface CancellationPolicyRepository {
  create(cancellationPolicy: CancellationPolicy): Promise<void>
  findById(id: string): Promise<CancellationPolicy | null>
}
