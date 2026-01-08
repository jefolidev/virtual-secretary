import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Bell } from 'lucide-react'
import { useState } from 'react'

export function NotificationsSettingsPage() {
  // Initial values for notifications
  const initialValues = {
    notifications: {
      newAppointments: true,
      cancellations: true,
      confirmations: false,
      dailySummary: true,
      confirmedList: false,
      payments: true,
    },
    notificationChannels: {
      email: true,
      whatsapp: false,
    },
  }

  const [notifications, setNotifications] = useState(
    initialValues.notifications
  )
  const [notificationChannels, setNotificationChannels] = useState(
    initialValues.notificationChannels
  )

  // Check if there are changes
  const hasChanges =
    JSON.stringify(notifications) !==
      JSON.stringify(initialValues.notifications) ||
    JSON.stringify(notificationChannels) !==
      JSON.stringify(initialValues.notificationChannels)

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleNotificationChannel = (
    key: keyof typeof notificationChannels
  ) => {
    setNotificationChannels((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const selectAllNotifications = () => {
    setNotifications({
      newAppointments: true,
      cancellations: true,
      confirmations: true,
      dailySummary: true,
      confirmedList: true,
      payments: true,
    })
  }

  const deselectAllNotifications = () => {
    setNotifications({
      newAppointments: false,
      cancellations: false,
      confirmations: false,
      dailySummary: false,
      confirmedList: false,
      payments: false,
    })
  }

  const selectAllChannels = () => {
    setNotificationChannels({
      email: true,
      whatsapp: true,
    })
  }

  const deselectAllChannels = () => {
    setNotificationChannels({
      email: false,
      whatsapp: false,
    })
  }

  const handleSave = () => {
    console.log('Salvando notificações:', {
      notifications,
      notificationChannels,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificações
        </CardTitle>
        <CardDescription>
          Configure como você gostaria de receber notificações sobre seus
          agendamentos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Notification Types Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Tipos de notificações
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllNotifications}
                  type="button"
                >
                  Selecionar todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllNotifications}
                  type="button"
                >
                  Desmarcar todos
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Escolha quais notificações você deseja receber
            </p>
            {!Object.values(notifications).some((n) => n) && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Selecione pelo menos uma notificação</span>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newAppointments"
                  checked={notifications.newAppointments}
                  onCheckedChange={() => toggleNotification('newAppointments')}
                />
                <Label htmlFor="newAppointments" className="font-normal">
                  Novos agendamentos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cancellations"
                  checked={notifications.cancellations}
                  onCheckedChange={() => toggleNotification('cancellations')}
                />
                <Label htmlFor="cancellations" className="font-normal">
                  Cancelamentos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmations"
                  checked={notifications.confirmations}
                  onCheckedChange={() => toggleNotification('confirmations')}
                />
                <Label htmlFor="confirmations" className="font-normal">
                  Confirmações de consulta
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dailySummary"
                  checked={notifications.dailySummary}
                  onCheckedChange={() => toggleNotification('dailySummary')}
                />
                <Label htmlFor="dailySummary" className="font-normal">
                  Resumo diário de agenda
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmedList"
                  checked={notifications.confirmedList}
                  onCheckedChange={() => toggleNotification('confirmedList')}
                />
                <Label htmlFor="confirmedList" className="font-normal">
                  Lista de confirmados do dia
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payments"
                  checked={notifications.payments}
                  onCheckedChange={() => toggleNotification('payments')}
                />
                <Label htmlFor="payments" className="font-normal">
                  Notificações de pagamento
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Channels Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Canais de notificação
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllChannels}
                  type="button"
                >
                  Selecionar todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllChannels}
                  type="button"
                >
                  Desmarcar todos
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Escolha como você deseja receber as notificações
            </p>
            {!notificationChannels.email && !notificationChannels.whatsapp && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Selecione pelo menos um canal de notificação</span>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={notificationChannels.email}
                  onCheckedChange={() => toggleNotificationChannel('email')}
                />
                <Label htmlFor="email" className="font-normal">
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={notificationChannels.whatsapp}
                  onCheckedChange={() => toggleNotificationChannel('whatsapp')}
                />
                <Label htmlFor="whatsapp" className="font-normal">
                  WhatsApp
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={!hasChanges}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
