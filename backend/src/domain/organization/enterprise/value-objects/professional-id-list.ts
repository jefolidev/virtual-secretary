import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { WatchedList } from '@/core/entities/watched-list'

export class ProfessionalIdList extends WatchedList<UniqueEntityId> {
  public compareItems(a: UniqueEntityId, b: UniqueEntityId): boolean {
    return a.equals(b)
  }
}
