import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeClient } from '@test/factories/make-client'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { EditClientUseCase } from './edit-client'

let inMemoryClientRepository: InMemoryClientRepository
let sut: EditClientUseCase

describe('Edit Client', () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    sut = new EditClientUseCase(inMemoryClientRepository)
  })

  it('should be able to edit a client', async () => {
    const client = makeClient(
      {
        extraPreferences: 'Lorem ipsum',
        periodPreference: ['MORNING'],
      },
      new UniqueEntityId('client-id')
    )

    await inMemoryClientRepository.create(client)

    expect(client.extraPreferences).toBe('Lorem ipsum')
    expect(client.periodPreference).toStrictEqual(['MORNING'])

    const response = await sut.execute({
      clientId: client.id.toString(),
      extraPreferences: 'Lorem ipsum colun',
      periodPreference: ['MORNING', 'AFTERNOON', 'EVENING'],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const updatedClient = response.value.client

      expect(updatedClient.extraPreferences).toBe('Lorem ipsum colun')
      expect(updatedClient.periodPreference).toStrictEqual([
        'MORNING',
        'AFTERNOON',
        'EVENING',
      ])

      const savedClient = await inMemoryClientRepository.findById(
        client.id.toString()
      )
      expect(savedClient).toBeTruthy()
      expect(savedClient?.extraPreferences).toBe('Lorem ipsum colun')
      expect(savedClient?.periodPreference).toStrictEqual([
        'MORNING',
        'AFTERNOON',
        'EVENING',
      ])
    }
  })
})
