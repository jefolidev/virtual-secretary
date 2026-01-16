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
import { useUser } from '@/hooks/use-user'
import type { NotificationChannel, NotificationType } from '@/types/user'
import { AlertCircle, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DualListBox from './components/dual-listbox'

const NOTIFICATION_TYPES: { key: NotificationType; label: string }[] = [
  { key: 'NEW_APPOINTMENT', label: 'Novos agendamentos' },
  { key: 'CANCELLATION', label: 'Cancelamentos' },
  { key: 'CONFIRMATION', label: 'Confirmações de consulta' },
  { key: 'DAILY_SUMMARY', label: 'Resumo diário de agenda' },
  { key: 'CONFIRMED_LIST', label: 'Lista de confirmados do dia' },
  { key: 'PAYMENT_STATUS', label: 'Notificações de pagamento' },
]

const NOTIFICATION_CHANNELS: { key: NotificationChannel; label: string }[] = [
  { key: 'EMAIL', label: 'Email' },
  { key: 'WHATSAPP', label: 'WhatsApp' },
]

export function NotificationsSettingsPage() {
  const { notificationSettings, updateProfessional, clearError } = useUser()

  // Map backend structure: settings.professional.notificationSettings.props
  const userAvailableTypes =
    notificationSettings?.professional?.notificationSettings?.props
      ?.enabledTypes

  const userAvailableChannels =
    notificationSettings?.professional?.notificationSettings?.props?.channels

  // Local state for immediate updates
  const [enabledTypes, setEnabledTypes] = useState<NotificationType[]>(
    userAvailableTypes || []
  )
  const [channels, setChannels] = useState<NotificationChannel[]>(
    userAvailableChannels || []
  )

  // Update local state when backend data changes
  useEffect(() => {
    setEnabledTypes(userAvailableTypes || [])
  }, [userAvailableTypes])

  useEffect(() => {
    setChannels(userAvailableChannels || [])
  }, [userAvailableChannels])

  const getAvailableNotifications = () => {
    return NOTIFICATION_TYPES.filter((type) => {
      return !enabledTypes?.includes(type.key)
    })
  }

  const getActiveNotifications = () => {
    return NOTIFICATION_TYPES.filter((type) => {
      return enabledTypes?.includes(type.key)
    })
  }

  const handleNotificationTypesChange = async (active: NotificationType[]) => {
    const previousEnabledTypes = enabledTypes

    try {
      // Update the form state immediately
      setEnabledTypes(active)

      // Make the API request immediately
      clearError()
      await updateProfessional({
        enabledTypes: active,
        channels: channels || [],
      })

      toast.success('Configurações de notificação atualizadas')
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      toast.error('Erro ao salvar configurações de notificação')

      // Revert the form state on error
      setEnabledTypes(previousEnabledTypes)
    }
  }

  const toggleChannel = async (channel: NotificationChannel) => {
    const current = channels || []
    const updated = current.includes(channel)
      ? current.filter((c: NotificationChannel) => c !== channel)
      : [...current, channel]

    try {
      // Update the local state immediately
      setChannels(updated)

      // Make the API request immediately
      clearError()
      await updateProfessional({
        enabledTypes: enabledTypes || [],
        channels: updated,
      })

      toast.success('Canais de notificação atualizados')
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      toast.error('Erro ao salvar canais de notificação')

      // Revert the local state on error
      setChannels(current)
    }
  }

  const toggleAllChannels = async (enable: boolean) => {
    const updated = enable ? NOTIFICATION_CHANNELS.map((c) => c.key) : []

    try {
      // Update the local state immediately
      setChannels(updated)

      // Make the API request immediately
      clearError()
      await updateProfessional({
        enabledTypes: enabledTypes || [],
        channels: updated,
      })

      toast.success('Canais de notificação atualizados')
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      toast.error('Erro ao salvar canais de notificação')

      // Revert the local state on error
      setChannels(channels || [])
    }
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
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Canais de notificação
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllChannels(true)}
              >
                Selecionar todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllChannels(false)}
              >
                Desmarcar todos
              </Button>
            </div>
          </div>

          {channels?.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>Selecione pelo menos um canal de notificação</span>
            </div>
          )}

          <div className="space-y-3">
            {NOTIFICATION_CHANNELS.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={channels?.includes(key)}
                  onCheckedChange={() => toggleChannel(key)}
                />
                <Label htmlFor={key} className="font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Types */}
        <Separator />

        <div className="space-y-4">
          <Label className="text-base font-medium">Tipos de notificação</Label>

          <div>
            <DualListBox
              available={getAvailableNotifications()}
              active={getActiveNotifications()}
              onActiveChange={handleNotificationTypesChange}
              availableLabel="Notificações Disponíveis"
              activeLabel="Notificações Ativas"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
