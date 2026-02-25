import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryEvaluationRepository } from '@test/repositories/in-memory-evaluation.repository'
import { beforeEach, describe, it } from 'vitest'
import { Evaluation } from '../../enterprise/entities/evaluation'
import { GetEvaluationCommentUseCase } from './get-evaluation-comment'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryEvaluationRepository: InMemoryEvaluationRepository

let sut: GetEvaluationCommentUseCase

describe('Get Evaluation Comment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEvaluationRepository = new InMemoryEvaluationRepository()

    sut = new GetEvaluationCommentUseCase(
      inMemoryAppointmentRepository,
      inMemoryEvaluationRepository,
    )
  })

  it('should create a evaluation just with comment', async () => {
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

    appointment.status = 'AWAITING_COMMENT'
    await inMemoryAppointmentRepository.save(appointment)

    const evalution = Evaluation.create({
      appointmentId: appointment.id.toString(),
      professionalId: professional.id.toString(),
      score: 4,
      comment: null,
    })

    await inMemoryEvaluationRepository.create(evalution)

    await sut.execute({
      appointmentId: appointment.id.toString(),
      comment: 'Great service!',
    })

    expect(inMemoryEvaluationRepository.items[0].comment).toEqual(
      'Great service!',
    )
    expect(inMemoryAppointmentRepository.items[0].status).toEqual('COMPLETED')
  })
})
