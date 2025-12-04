export class UniqueEntityId {
  private value: string

  toString() {
    return this.value
  }

  toValue() {
    return this.value
  }

  constructor(value?: string) {
    this.value = value || crypto.randomUUID()
  }

  equals(id: UniqueEntityId) {
    return id.toValue() === this.value
  }
}
