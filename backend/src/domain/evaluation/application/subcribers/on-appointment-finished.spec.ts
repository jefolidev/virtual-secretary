import { User } from '@/domain/scheduling/enterprise/entities/user'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeClient } from '@test/factories/make-client'
import { makeProfessional } from '@test/factories/make-professional'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointments.repository'
import { InMemoryProfessionalRepository } from '@test/repositories/in-memory-professional.repository'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user.repository'
import { InMemoryWhatsappRepository } from '@test/repositories/in-memory-whatsapp.repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { OnAppointmentFinished } from './on-appointment-finished'

// lightweight waitFor replacement for environments without vi.waitFor
async function waitForAssert(fn: () => void, timeout = 2000, interval = 10) {
  const start = Date.now()
  return new Promise<void>((resolve, reject) => {
    const t = setInterval(() => {
      try {
        fn()
        clearInterval(t)
        resolve()
      } catch (err) {
        if (Date.now() - start > timeout) {
          clearInterval(t)
          reject(err)
        }
      }
    }, interval)
  })
}

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryProfessionalRepository: InMemoryProfessionalRepository
let inMemoryUserRepository: InMemoryUserRepository
let inMemoryWhatsappRepository: InMemoryWhatsappRepository

describe('On Appointment Finished', () => {
  beforeEach(() => {
    inMemoryProfessionalRepository = new InMemoryProfessionalRepository()
    inMemoryUserRepository = new InMemoryUserRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryWhatsappRepository = new InMemoryWhatsappRepository()

    new OnAppointmentFinished(
      inMemoryProfessionalRepository,
      inMemoryUserRepository,
      inMemoryWhatsappRepository,
      inMemoryAppointmentRepository,
    )
  })

  it('should send a message when appointment is finished', async () => {
    const professional = makeProfessional()
    const client = makeClient()

    const userClient = User.create({
      name: 'Client Name',
      whatsappNumber: '+55999999999',
      clientId: client.id,
      cpf: '12345678900',
      birthDate: new Date('1990-01-01'),
      email: 'client@example.com',
      gender: 'MALE',
      password: 'hashed-password',
      role: 'CLIENT',
    })

    const userProfessional = User.create({
      name: 'Professional Name',
      whatsappNumber: '+55999999911',
      professionalId: professional.id,
      cpf: '12345678900',
      birthDate: new Date('1990-01-01'),
      email: 'professional@example.com',
      gender: 'MALE',
      password: 'hashed-password',
      role: 'PROFESSIONAL',
    })

    await inMemoryProfessionalRepository.create(professional)

    await inMemoryUserRepository.create(userProfessional)
    await inMemoryUserRepository.create(userClient)

    const appointment = makeAppointment({
      clientId: client.id,
      professionalId: professional.id,
    })

    await inMemoryAppointmentRepository.create(appointment)

    appointment.start()

    inMemoryAppointmentRepository.save(appointment)

    appointment.complete()

    inMemoryAppointmentRepository.save(appointment)

    await waitForAssert(() => {
      expect(inMemoryWhatsappRepository.sendMessage).toHaveBeenCalled()
    })
  })
})
