import type { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import type { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import type { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import type { InMemoryTransactionRepository } from '@test/repositories/in-memory-transactions.repository'
import type { InitiateNewTransactionUseCase } from './initiate-new-transaction'

let inMemoryTransactionRepository: InMemoryTransactionRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository

let sut: InitiateNewTransactionUseCase

// describe('Create Transaction', () => {
//   beforeEach(() => {
//     inMemoryTransactionRepository = new InMemoryTransactionRepository()
//     inMemoryClientRepository = new InMemoryClientRepository()
//     inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
//     inMemoryScheduleConfigurationRepository =
//       new InMemoryScheduleConfigurationRepository()

//     sut = new InitiateNewTransactionUseCase(
//       inMemoryAppointmentRepository,
//       inMemoryTransactionRepository,
//       inMemoryClientRepository
//     )
//   })

//   it('should be able to create an transaction', async () => {
//     expect(response.isRight()).toBe(true)

//     if (response.isRight()) {
//     }
//   })
// })
