import { BadRequestError } from '@/core/errors/bad-request'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryClientRepository } from '@test/repositories/in-memory-client.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PauseAppointmentUseCase } from './pause-appointment'

let appointmentsRepository: InMemoryAppointmentRepository
let clientRepository: InMemoryClientRepository
let professionalRepository: InMemoryProfessionalRepository
let sut: PauseAppointmentUseCase

describe('PauseAppointmentUseCase', () => {
  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentRepository()
    clientRepository = new InMemoryClientRepository()
    professionalRepository = new InMemoryProfessionalRepository()

    sut = new PauseAppointmentUseCase(
      appointmentsRepository,
      clientRepository,
      professionalRepository
    )

    vi.useFakeTimers()
  })

  it('should be able to pause an appointment that is in progress', async () => {
    const client = makeClient()
    await clientRepository.create(client)

    const professional = makeProfessional()
    await professionalRepository.create(professional)

    const appointment = makeAppointment({
      clientId: client.id,
      professionalId: professional.id,
      status: 'IN_PROGRESS',
      startedAt: new Date(Date.now() - 10 * 60 * 1000), // Started 10 minutes ago
    })
    await appointmentsRepository.create(appointment)

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
      professionalId: professional.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.appointment.status).toBe('IN_PROGRESS')
      expect(result.value.appointment.startedAt).toBe(null)
      expect(result.value.appointment.totalElapsedMs).toBe(10 * 60 * 1000)
    }
  })

  it('should not be able to pause an appointment that is not in progress', async () => {
    const client = makeClient()
    await clientRepository.create(client)

    const professional = makeProfessional()
    await professionalRepository.create(professional)

    const appointment = makeAppointment({
      clientId: client.id,
      professionalId: professional.id,
      status: 'SCHEDULED',
    })
    await appointmentsRepository.create(appointment)

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
      professionalId: professional.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(BadRequestError)
  })
})
