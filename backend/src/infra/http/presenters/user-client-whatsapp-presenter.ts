import { UserClientWhatsappAppointments } from '@/domain/scheduling/enterprise/entities/value-objects/user-with-clients-and-appointments'

export class UserClientWhatsappPresenter {
  static toHTTP(registredUser: UserClientWhatsappAppointments) {
    return {
      id: registredUser.id ? registredUser.id.toString() : null,
      isRegistered: registredUser.isRegistered,
      user: registredUser.user
        ? {
            id: registredUser.user.id.toString(),
            name: registredUser.user.name,
            email: registredUser.user.email,
          }
        : null,
      client: registredUser.client
        ? {
            id: registredUser.client.id
              ? registredUser.client.id.toString()
              : null,
            periodPreference: registredUser.client.periodPreference || [],
            extraPreferences: registredUser.client.extraPreferences || null,
          }
        : null,
      whatsappContact: registredUser.whatsappContact
        ? {
            id: (registredUser.whatsappContact as any).id
              ? (registredUser.whatsappContact as any).id.toString()
              : null,
            phone: (registredUser.whatsappContact as any).phone || null,
            nickName: (registredUser.whatsappContact as any).nickName || null,
            profilePicUrl:
              (registredUser.whatsappContact as any).profilePicUrl || null,
            userId: (registredUser.whatsappContact as any).userId || null,
            lastSeen: (registredUser.whatsappContact as any).lastSeen || null,
          }
        : null,
      appointments: registredUser.appointments.map((a: any) => ({
        id: a.id ? a.id.toString() : null,
        startDateTime: a.startDateTime,
        endDateTime: a.endDateTime,
        modality: a.modality,
        status: a.status,
        googleMeetLink: a.googleMeetLink || null,
      })),
    }
  }
}
