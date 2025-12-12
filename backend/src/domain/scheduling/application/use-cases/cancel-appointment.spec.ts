import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeCancellationPolicy } from '@test/factories/make-cancellation-policy'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryCancellationPolicyRepository } from '../../../../../test/repositories/in-memory-cancellation-policy.repository'
import { CancelAppointmentUseCase } from './cancel-appointment'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryCancellationPolicyRepository: InMemoryCancellationPolicyRepository
let sut: CancelAppointmentUseCase

describe('Cancel Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryCancellationPolicyRepository =
      new InMemoryCancellationPolicyRepository()
    sut = new CancelAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryProfessionalRepository,
      inMemoryCancellationPolicyRepository,
      inMemoryClientRepository
    )
  })

  it('should be able to cancel an appointment', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      { cancellationPolicyId: new UniqueEntityId('cancellation-policy-id') },
      new UniqueEntityId('professional-id')
    )

    inMemoryProfessionalRepository.create(professional)

    const cancellationPolicy = makeCancellationPolicy(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('cancellation-policy-id')
    )

    inMemoryCancellationPolicyRepository.create(cancellationPolicy)

    professional.cancellationPolicyId = new UniqueEntityId(
      'cancellation-policy-id'
    )

    inMemoryProfessionalRepository.save(professional)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      new UniqueEntityId('appointment-id')
    )

    inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.appointment).toBe(appointment)
      expect(response.value.appointment.status).toBe('CANCELLED')

      expect(inMemoryAppointmentRepository.items).toHaveLength(1)
      expect(inMemoryProfessionalRepository.items).toHaveLength(1)
      expect(inMemoryClientRepository.items).toHaveLength(1)
      expect(inMemoryCancellationPolicyRepository.items).toHaveLength(1)
    }
  })
})
