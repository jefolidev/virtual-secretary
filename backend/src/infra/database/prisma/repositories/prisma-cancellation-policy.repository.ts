import { CancellationPolicyRepository } from '@/domain/scheduling/application/repositories/cancellation-policy.repository'
import { CancellationPolicy } from '@/domain/scheduling/enterprise/entities/cancellation-policy'
import { Injectable } from '@nestjs/common'

@Injectable({})
export class PrismaCancellationPolicyRepository
  implements CancellationPolicyRepository
{
  create(cancellationPolicy: CancellationPolicy): Promise<void> {
    throw new Error('Method not implemented.')
  }
  findById(id: string): Promise<CancellationPolicy | null> {
    throw new Error('Method not implemented.')
  }
  findByProfessionalId(
    professionalId: string
  ): Promise<CancellationPolicy | null> {
    throw new Error('Method not implemented.')
  }
  save(cancellationPolicy: CancellationPolicy): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
