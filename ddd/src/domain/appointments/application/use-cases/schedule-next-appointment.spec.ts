import { UniqueEntityId } from '@src/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeCancellationPolicy } from '@test/factories/make-cancellation-policy'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryCancellationPolicyRepository } from '@test/repositories/in-memory-cancellation-policy.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { NoDisponibilityError } from './errors/no-disponibility-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { NotFoundError } from './errors/resource-not-found-error'
import { ScheduleNextAppointmentUseCase } from './schedule-next-appointment'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryCancellationPolicyRepository: InMemoryCancellationPolicyRepository
let sut: ScheduleNextAppointmentUseCase

describe('Schedule Next Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryCancellationPolicyRepository =
      new InMemoryCancellationPolicyRepository()
    inMemoryClientRepository = new InMemoryClientRepository()
    sut = new ScheduleNextAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryClientRepository,
      inMemoryProfessionalRepository,
      inMemoryCancellationPolicyRepository
    )
  })

  it('should be able to reschedule the next appointment', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const cancellationPolicy = makeCancellationPolicy(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('reschedule-policy-id')
    )

    await inMemoryCancellationPolicyRepository.create(cancellationPolicy)

    professional.cancellationPolicyId = new UniqueEntityId(
      'reschedule-policy-id'
    )

    await inMemoryProfessionalRepository.save(professional)

    const alreadyFinishedAppointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        startDateTime: new Date('2025-09-05T10:00:00.000Z'),
        endDateTime: new Date('2025-09-05T11:00:00.000Z'),
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(alreadyFinishedAppointment)

    alreadyFinishedAppointment.status = 'COMPLETED'
    inMemoryAppointmentRepository.save(alreadyFinishedAppointment)

    const response = await sut.execute({
      clientId: client.id.toString(),
      professionalId: professional.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
      endDateTime: new Date('2026-01-05T11:00:00.000Z'),
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const oldAppointment = await inMemoryAppointmentRepository.findById(
        new UniqueEntityId('appointment-id')
      )

      expect(oldAppointment!.status).toBe('COMPLETED')
      expect(response.value.appointment.status).toBe('SCHEDULED')
    }
  })

  it('should not be able to reschedule next appointment if dont exists a finished appointement', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const cancellationPolicy = makeCancellationPolicy(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('reschedule-policy-id')
    )

    await inMemoryCancellationPolicyRepository.create(cancellationPolicy)

    professional.cancellationPolicyId = new UniqueEntityId(
      'reschedule-policy-id'
    )

    await inMemoryProfessionalRepository.save(professional)

    const response = await sut.execute({
      clientId: client.id.toString(),
      professionalId: professional.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
      endDateTime: new Date('2026-01-05T11:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to schedule next appointment if exist overlapping', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const cancellationPolicy = makeCancellationPolicy(
      {
        professionalId: new UniqueEntityId('professional-id'),
      },
      new UniqueEntityId('reschedule-policy-id')
    )

    await inMemoryCancellationPolicyRepository.create(cancellationPolicy)

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

    const alreadyFinishedAppointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        startDateTime: new Date('2025-09-05T10:00:00.000Z'),
        endDateTime: new Date('2025-09-05T11:00:00.000Z'),
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(alreadyFinishedAppointment)

    alreadyFinishedAppointment.status = 'COMPLETED'
    inMemoryAppointmentRepository.save(alreadyFinishedAppointment)

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
      clientId: client.id.toString(),
      professionalId: professional.id.toString(),
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

  it('should not be able to reschedule an appointment if reschedule has less than 6 days', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))
    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const cancellationPolicy = makeCancellationPolicy(
      {
        professionalId: professional.id,
      },
      new UniqueEntityId('reschedule-policy-id')
    )

    await inMemoryCancellationPolicyRepository.create(cancellationPolicy)

    professional.cancellationPolicyId = cancellationPolicy.id
    await inMemoryProfessionalRepository.save(professional)

    const alreadyFinishedAppointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        startDateTime: new Date('2025-09-05T10:00:00.000Z'),
        endDateTime: new Date('2025-09-05T11:00:00.000Z'),
      },
      new UniqueEntityId('appointment-id')
    )

    await inMemoryAppointmentRepository.create(alreadyFinishedAppointment)

    alreadyFinishedAppointment.status = 'COMPLETED'
    inMemoryAppointmentRepository.save(alreadyFinishedAppointment)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        startDateTime: new Date('2025-09-05T10:00:00.000Z'),
        endDateTime: new Date('2025-09-05T11:00:00.000Z'),
        status: 'COMPLETED',
      },
      new UniqueEntityId('appointment-id-original')
    )

    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      clientId: client.id.toString(),
      professionalId: professional.id.toString(),
      startDateTime: new Date('2025-09-09T10:00:00.000Z'),
      endDateTime: new Date('2025-09-09T11:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NotAllowedError)
  })
})
