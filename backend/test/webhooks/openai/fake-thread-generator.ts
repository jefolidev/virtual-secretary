import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ThreadGenerator } from '@/domain/scheduling/application/webhook/openai/thread-generator'

export class FakeThreadGenerator extends ThreadGenerator {
  async create(): Promise<string> {
    return await new UniqueEntityId().toString()
  }
}
