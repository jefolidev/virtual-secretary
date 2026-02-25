import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryEvaluationRepository } from '@test/repositories/in-memory-evaluation.repository'
import { beforeEach, describe, it } from 'vitest'
import { GetEvaluationScoreUseCase } from './get-evaluation-score'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryEvaluationRepository: InMemoryEvaluationRepository

let sut: GetEvaluationScoreUseCase

describe('Get Evaluation Score', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEvaluationRepository = new InMemoryEvaluationRepository()

    sut = new GetEvaluationScoreUseCase(
      inMemoryAppointmentRepository,
      inMemoryEvaluationRepository,
    )
  })

  it('should create a evaluation just with score', async () => {
    const professional = makeProfessional()
    const client = makeClient()

    const appointment = makeAppointment({
      clientId: client.id,
      professionalId: professional.id,
    })

    await inMemoryAppointmentRepository.create(appointment)
    appointment.start()
    await inMemoryAppointmentRepository.save(appointment)
    appointment.complete()
    await inMemoryAppointmentRepository.save(appointment)

    expect(inMemoryAppointmentRepository.items[0].status).toEqual(
      'AWAITING_SCORE',
    )

    await sut.execute({
      appointmentId: appointment.id.toString(),
      score: 4,
    })

    expect(inMemoryEvaluationRepository.items[0].score).toEqual(4)
    expect(inMemoryAppointmentRepository.items[0].status).toEqual('AWAITING_COMMENT')
  })
})
