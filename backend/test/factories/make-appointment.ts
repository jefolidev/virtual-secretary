import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { faker } from '@faker-js/faker'

import {
  Appointment,
  type AppointmentProps,
} from '@/domain/scheduling/enterprise/entities/appointment'

export function makeAppointment(
  override?: Partial<AppointmentProps>,
  id?: UniqueEntityId
) {
  const appointment: Appointment = Appointment.create(
    {
      clientId: new UniqueEntityId(),
      professionalId: new UniqueEntityId(),
      startDateTime: new Date(),
      endDateTime: new Date(),
      modality: 'ONLINE',
      status: 'CANCELLED',
      agreedPrice: 2000,
      googleMeetLink: faker.internet.url(),
      ...override,
    },
    id
  )

  return appointment
}
