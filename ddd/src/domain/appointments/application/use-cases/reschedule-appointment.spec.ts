import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeCancellationPolicy } from '@test/factories/make-cancellation-policy'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryCancellationPolicyRepository } from '@test/repositories/in-memory-cancellation-policy.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { NotAllowedError } from '../../../../core/errors/not-allowed-error'
import { NoDisponibilityError } from './errors/no-disponibility-error'
import { RescheduleAppointmentUseCase } from './reschedule-appointment'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryCancellationPolicyRepository: InMemoryCancellationPolicyRepository
let sut: RescheduleAppointmentUseCase

describe('Reschedule Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryCancellationPolicyRepository =
      new InMemoryCancellationPolicyRepository()
    sut = new RescheduleAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryProfessionalRepository,
      inMemoryCancellationPolicyRepository,
      inMemoryClientRepository
    )
  })

  it('should be able to reschedule an appointment', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
      },
      new UniqueEntityId('professional-id')
    )

    inMemoryProfessionalRepository.create(professional)

    const reschedulelationPolicy = makeCancellationPolicy(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('reschedule-policy-id')
    )

    await inMemoryCancellationPolicyRepository.create(reschedulelationPolicy)

    professional.cancellationPolicyId = new UniqueEntityId(
      'reschedule-policy-id'
    )

    inMemoryProfessionalRepository.save(professional)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
      endDateTime: new Date('2026-01-05T11:00:00.000Z'),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.appointment).toBe(appointment)
      expect(response.value.appointment.status).toBe('RESCHEDULED')
    }
  })

  it('should not be able to reschedule an appointment if professional not allow', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const reschedulelationPolicy = makeCancellationPolicy(
      {
        professionalId: new UniqueEntityId('professional-id'),
        allowReschedule: false,
      },
      new UniqueEntityId('reschedule-policy-id')
    )

    await inMemoryCancellationPolicyRepository.create(reschedulelationPolicy)

    professional.cancellationPolicyId = new UniqueEntityId(
      'reschedule-policy-id'
    )

    await inMemoryProfessionalRepository.save(professional)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
      endDateTime: new Date('2026-01-05T11:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NoDisponibilityError)
    }
  })

  it('should not be able to reschedule an appointment if exist overlapping', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const reschedulelationPolicy = makeCancellationPolicy(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('reschedule-policy-id')
    )

    await inMemoryCancellationPolicyRepository.create(reschedulelationPolicy)

    professional.cancellationPolicyId = new UniqueEntityId(
      'reschedule-policy-id'
    )

    await inMemoryProfessionalRepository.save(professional)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(appointment)

    const overlapAppointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        startDateTime: new Date('2026-01-05T10:00:00.000Z'),
        endDateTime: new Date('2026-01-05T11:00:00.000Z'),
      },
      new UniqueEntityId('overlap-appointment-id')
    )

    await inMemoryAppointmentRepository.create(overlapAppointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
      endDateTime: new Date('2026-01-05T11:00:00.000Z'),
    })

    const overlappingAppointments =
      await inMemoryAppointmentRepository.findOverlapping(
        professional.id,
        new Date('2026-01-05T10:00:00.000Z'),
        new Date('2026-01-05T11:00:00.000Z')
      )

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(overlappingAppointments).toHaveLength(1)
      expect(response.value).toBeInstanceOf(NoDisponibilityError)
    }
  })

  it('should not be able to reschedule an appointment if client not allowed', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))
    const anotherClient = makeClient(
      undefined,
      new UniqueEntityId('client-id#02')
    )

    await inMemoryClientRepository.create(client)
    await inMemoryClientRepository.create(anotherClient)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
      },
      new UniqueEntityId('professional-id')
    )

    inMemoryProfessionalRepository.create(professional)

    const reschedulelationPolicy = makeCancellationPolicy(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('reschedule-policy-id')
    )

    await inMemoryCancellationPolicyRepository.create(reschedulelationPolicy)

    professional.cancellationPolicyId = new UniqueEntityId(
      'reschedule-policy-id'
    )

    await inMemoryProfessionalRepository.save(professional)

    const appointment = makeAppointment(
      {
        clientId: new UniqueEntityId('client-id#02'),
        professionalId: professional.id,
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
      endDateTime: new Date('2026-01-05T11:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NotAllowedError)
  })
})
