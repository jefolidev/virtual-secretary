import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeCancellationPolicy } from '@test/factories/make-cancellation-policy'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { makeScheduleConfiguration } from '@test/factories/make-schedule-configuration'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryCancellationPolicyRepository } from '@test/repositories/in-memory-cancellation-policy.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryScheduleConfigurationRepository } from '@test/repositories/in-memory-schedule-configuration.repository'
import { NotAllowedError } from '../../../../core/errors/not-allowed-error'
import { NotFoundError } from '../../../../core/errors/resource-not-found-error'
import { NoDisponibilityError } from './errors/no-disponibility-error'
import { RescheduleAppointmentUseCase } from './reschedule-appointment'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryClientRepository: InMemoryClientRepository
let inMemoryCancellationPolicyRepository: InMemoryCancellationPolicyRepository
let inMemoryScheduleConfigurationRepository: InMemoryScheduleConfigurationRepository
let sut: RescheduleAppointmentUseCase

describe('Reschedule Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryCancellationPolicyRepository =
      new InMemoryCancellationPolicyRepository()
    inMemoryScheduleConfigurationRepository =
      new InMemoryScheduleConfigurationRepository()
    sut = new RescheduleAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryProfessionalRepository,
      inMemoryCancellationPolicyRepository,
      inMemoryScheduleConfigurationRepository,
      inMemoryClientRepository
    )
  })

  it('should be able to reschedule an appointment', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        sessionDurationMinutes: 60,
      },
      new UniqueEntityId('schedule-config-id')
    )

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

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

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
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
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        sessionDurationMinutes: 60,
      },
      new UniqueEntityId('schedule-config-id')
    )

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

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
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotAllowedError)
    }
  })

  it('should not be able to reschedule an appointment if exist overlapping', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))

    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )

    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        sessionDurationMinutes: 60,
      },
      new UniqueEntityId('schedule-config-id')
    )

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

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
        startDateTime: new Date('2026-01-05T08:00:00.000Z'),
        endDateTime: new Date('2026-01-05T09:00:00.000Z'),
        status: 'SCHEDULED',
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
        status: 'SCHEDULED',
      },
      new UniqueEntityId('overlap-appointment-id')
    )

    await inMemoryAppointmentRepository.create(overlapAppointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)

    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NoDisponibilityError)
    }
  })

  it('should not be able to reschedule to a past date', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))
    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )
    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        sessionDurationMinutes: 60,
      },
      new UniqueEntityId('schedule-config-id')
    )

    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

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

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2020-01-05T10:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NoDisponibilityError)
    }
  })

  it('should not be able to reschedule a non-existent appointment', async () => {
    const response = await sut.execute({
      id: 'non-existent-id',
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotFoundError)
      expect(response.value.message).toBe('Appointment not found')
    }
  })

  it('should not be able to reschedule a cancelled appointment', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))
    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )
    await inMemoryProfessionalRepository.create(professional)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
        status: 'CANCELLED',
      },
      new UniqueEntityId('appointment-id')
    )
    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotAllowedError)
    }
  })

  it('should not be able to reschedule if client not found', async () => {
    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )
    await inMemoryProfessionalRepository.create(professional)

    const appointment = makeAppointment(
      {
        clientId: new UniqueEntityId('non-existent-client'),
        professionalId: professional.id,
      },
      new UniqueEntityId('appointment-id')
    )
    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotFoundError)
      expect(response.value.message).toBe('Client not found')
    }
  })

  it('should not be able to reschedule if professional not found', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))
    await inMemoryClientRepository.create(client)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: new UniqueEntityId('non-existent-professional'),
      },
      new UniqueEntityId('appointment-id')
    )
    await inMemoryAppointmentRepository.create(appointment)

    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime: new Date('2026-01-05T10:00:00.000Z'),
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotFoundError)
      expect(response.value.message).toBe('Professional not found')
    }
  })

  it('should not be able to reschedule if schedule configuration not found', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))
    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )
    await inMemoryProfessionalRepository.create(professional)

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
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotFoundError)
      expect(response.value.message).toBe(
        'Professional schedule configuration not found'
      )
    }
  })

  it('should not be able to reschedule if cancellation policy not found', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))
    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )
    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        sessionDurationMinutes: 60,
      },
      new UniqueEntityId('schedule-config-id')
    )
    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

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
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(response.value.message).toBe(
        'Professional does not allow reschedule'
      )
    }
  })

  it('should correctly calculate end time based on session duration', async () => {
    const client = makeClient(undefined, new UniqueEntityId('client-id'))
    await inMemoryClientRepository.create(client)

    const professional = makeProfessional(
      {
        cancellationPolicyId: new UniqueEntityId('reschedule-policy-id'),
        scheduleConfigurationId: new UniqueEntityId('schedule-config-id'),
      },
      new UniqueEntityId('professional-id')
    )
    await inMemoryProfessionalRepository.create(professional)

    const scheduleConfiguration = makeScheduleConfiguration(
      {
        professionalId: professional.id,
        sessionDurationMinutes: 90,
      },
      new UniqueEntityId('schedule-config-id')
    )
    await inMemoryScheduleConfigurationRepository.create(scheduleConfiguration)

    const reschedulelationPolicy = makeCancellationPolicy(
      {
        professionalId: professional.id,
      },
      new UniqueEntityId('reschedule-policy-id')
    )
    await inMemoryCancellationPolicyRepository.create(reschedulelationPolicy)

    const appointment = makeAppointment(
      {
        clientId: client.id,
        professionalId: professional.id,
      },
      new UniqueEntityId('appointment-id')
    )
    await inMemoryAppointmentRepository.create(appointment)

    const startDateTime = new Date('2026-01-05T10:00:00.000Z')
    const response = await sut.execute({
      id: appointment.id.toString(),
      startDateTime,
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.appointment.startDateTime).toEqual(startDateTime)
      expect(response.value.appointment.endDateTime).toEqual(
        new Date('2026-01-05T11:30:00.000Z')
      )
    }
  })
})
