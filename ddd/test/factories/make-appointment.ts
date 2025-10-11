import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@src/core/entities/unique-entity-id'

import {
  Appointment,
  type AppointmentProps,
} from '@src/domain/appointments/enterprise/entities/appointment'

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
      googleMeetLink: faker.internet.url(),
      price: 100,
      ...override,
    },
    id
  )

  return appointment
}
