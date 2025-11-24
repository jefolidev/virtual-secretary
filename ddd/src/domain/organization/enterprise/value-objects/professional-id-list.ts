import type { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { WatchedList } from '@src/core/entities/watched-list'

export class ProfessionalIdList extends WatchedList<UniqueEntityId> {
  public compareItems(a: UniqueEntityId, b: UniqueEntityId): boolean {
    return a === b
  }
}
