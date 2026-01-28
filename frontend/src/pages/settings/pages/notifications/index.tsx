import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useUser } from '@/hooks/use-user'
import type { NotificationType } from '@/types/user'
import { Bell } from 'lucide-react'
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

export function NotificationsSettingsPage() {
  const { notificationSettings, updateProfessional, clearError } = useUser()

  // Map backend structure: settings.professional.notificationSettings.props
  const userAvailableTypes =
    notificationSettings?.professional?.notificationSettings?.props
      ?.enabledTypes

  // Local state for immediate updates
  const [enabledTypes, setEnabledTypes] = useState<NotificationType[]>(
    userAvailableTypes || [],
  )

  // Update local state when backend data changes
  useEffect(() => {
    setEnabledTypes(userAvailableTypes || [])
  }, [userAvailableTypes])

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
      })

      toast.success('Configurações de notificação atualizadas')
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      toast.error('Erro ao salvar configurações de notificação')

      // Revert the form state on error
      setEnabledTypes(previousEnabledTypes)
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
