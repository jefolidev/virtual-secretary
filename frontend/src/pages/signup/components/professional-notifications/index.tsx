import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface ProfessionalNotificationsProps {
  notifications: {
    newAppointments: boolean
    cancellations: boolean
    confirmations: boolean
    dailySummary: boolean
    confirmedList: boolean
  }
  notificationChannels: {
    email: boolean
    whatsapp: boolean
  }
  onToggleNotification: (
    key:
      | 'newAppointments'
      | 'cancellations'
      | 'confirmations'
      | 'dailySummary'
      | 'confirmedList'
  ) => void
  onToggleNotificationChannel: (key: 'email' | 'whatsapp') => void
}

export function ProfessionalNotifications({
  notifications,
  notificationChannels,
  onToggleNotification,
  onToggleNotificationChannel,
}: ProfessionalNotificationsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Notificações que deseja receber</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newAppointments"
              checked={notifications.newAppointments}
              onCheckedChange={() => onToggleNotification('newAppointments')}
            />
            <Label htmlFor="newAppointments" className="font-normal">
              Novos agendamentos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cancellations"
              checked={notifications.cancellations}
              onCheckedChange={() => onToggleNotification('cancellations')}
            />
            <Label htmlFor="cancellations" className="font-normal">
              Cancelamentos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirmations"
              checked={notifications.confirmations}
              onCheckedChange={() => onToggleNotification('confirmations')}
            />
            <Label htmlFor="confirmations" className="font-normal">
              Confirmações de consulta
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dailySummary"
              checked={notifications.dailySummary}
              onCheckedChange={() => onToggleNotification('dailySummary')}
            />
            <Label htmlFor="dailySummary" className="font-normal">
              Resumo diário de agenda
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirmedList"
              checked={notifications.confirmedList}
              onCheckedChange={() => onToggleNotification('confirmedList')}
            />
            <Label htmlFor="confirmedList" className="font-normal">
              Lista de confirmados do dia
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Canais de notificação</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={notificationChannels.email}
              onCheckedChange={() => onToggleNotificationChannel('email')}
            />
            <Label htmlFor="email" className="font-normal">
              Email
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="whatsapp"
              checked={notificationChannels.whatsapp}
              onCheckedChange={() => onToggleNotificationChannel('whatsapp')}
            />
            <Label htmlFor="whatsapp" className="font-normal">
              WhatsApp
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
